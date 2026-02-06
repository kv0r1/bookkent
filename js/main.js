function setCookie(name, value, hours) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function setLoading(boolean) {
    document.querySelector(".loader").style.display = boolean ? "block" : "none";
}

const url = "http://127.0.0.1:5000"

function modal_alert(text) {
    //заглушка
    alert(text)

}

document.querySelector(".divider").onclick = ()=>{
    eraseCookie("token")
    setup_login_page()
}



function log_in() {
    setLoading(true)
    let login = document.querySelector("#login").value
    let code = document.querySelector("#code").value

    fetch(`${url}/books/login`, {
        method: "post",

        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "name": login,
            "secret_code": code
        })
    }).then(r => {
        if (r.status == 200) {
            return r.json()
        } else {
            setLoading(false)
            modal_alert("неверный логин или пароль!!!")
            document.querySelector("#login").value = ""
            document.querySelector("#code").value = ""
            return false
        }
    }).then(r => {
        if (r) {
            console.log(r);

            setCookie("token", r.token, 3)
            setLoading(false)
            setup_fragment_page()
        }
    })
}

function setup_login_page() {
    if (!getCookie("token")) {
        setLoading(true)
        setTimeout(() => {
            document.querySelector(".main__content").innerHTML = `
                    <form class="login-form">
                        <label for="#login">
                            <h2>Логин</h2>
                        </label>
                        <div class="input">
                            <input type="text" id="login" placeholder="логин!!!!">
                        </div>
                        <label for="#code">
                            <h2>Код</h2>
                        </label>
                        <div class="input">
                            <input type="text" id="code" placeholder="секретни код!">
                        </div>
                        <button class="button" id="login-button">
                            войти
                        </button>
                    </form>`

            document.querySelector("#login-button").onclick = (e) => {
                e.preventDefault()
                log_in()
            }
            setLoading(false)
        }, 1500);
    } else {
        setup_fragment_page()
    }
}


function get_fragment() {
    setLoading(true)
    fetch(`${url}/books/get-book-fragment`, {
        method: "get",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        }
    }).then(r => {
        if (r.ok) {
            return r.json()
        } else {
            setLoading(false)
            modal_alert("срок сессии истек! выполните вход заново!!")
            eraseCookie("token")
            setup_login_page()
            return false
        }
    }).then(r => {
        console.log(r);

        setup_fragment_page()
    })
}


function set_read_true() {
    setLoading(true)
    fetch(`${url}/books/set-read-true`, {
        method: "get",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        }
    }).then(r => {
        if (r.ok) {
            return r.json()
        } else {
            setLoading(false)
            modal_alert("срок сессии истек! выполните вход заново!!")
            eraseCookie("token")
            setup_login_page()
            return false
        }
    }).then(r => {
        console.log(r);
        setup_fragment_page()
    })
}
function set_read_false() {
    setLoading(true)
    fetch(`${url}/books/set-read-false`, {
        method: "get",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        }
    }).then(r => {
        if (r.ok) {
            return r.json()
        } else {
            setLoading(false)
            modal_alert("срок сессии истек! выполните вход заново!!")
            eraseCookie("token")
            setup_login_page()
            return false
        }
    }).then(r => {
        console.log(r);
        setup_fragment_page()
    })
}


function setup_fragment_page() {
    setLoading(true)
    setTimeout(() => {
        fetch(`${url}/books/get-user`, {
            method: "get",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            }
        })
            .then(r => {
                if (r.ok) {
                    return r.json()
                } else {
                    setLoading(false)
                    modal_alert("срок сессии истек! выполните вход заново!!")
                    eraseCookie("token")
                    setup_login_page()
                    return false
                }
            }).then(r => {
                console.log(r);

                document.querySelector(".main__content").innerHTML = `
                    <h2 id="username">${r.name}</h2>
                    <div class="fragment"><p>${r.partner.nickname}: ${r.partner.name}</p>
                    <p>${r.partner.is_reading ? `сейчас читает: ${r.partner.book_author} - ${r.partner.book_title}` : "сейчас ничего не читает!!"}</p>
                    </div>
                    ${!r.is_reading ? `<div class="button" id="get-fragment">получить фрагмент</div>` : `<div class="fragment"><p>сейчас читаю!! новое пока нельзя!</p></div>`}
                    <div class="fragment" id="main-fragment">${r.fragment ? r.fragment.split("\n").map(line => `<p>${line}</p>`).join("") : "<p>еще нет фрагмента текста!</p>"}</div>
                    ${r.fragment && !r.is_reading ? `<div class="button" id="set_read_true">хочу прочитать!!!</div>` : ""}
                    ${r.fragment && r.is_reading ? `<div class="button" id="set_read_false">прочитано!!</div>` : ""}
                    `
                setLoading(false)


                if (!r.is_reading) document.querySelector("#get-fragment").onclick = get_fragment

                if (r.fragment && !r.is_reading) document.querySelector("#set_read_true").onclick = set_read_true
                if (r.fragment && r.is_reading) document.querySelector("#set_read_false").onclick = set_read_false

            })
    }, 1500);
}

setup_login_page()

