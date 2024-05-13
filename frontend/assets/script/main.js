// query selectors buttons
const loginModalBtn = document.querySelector("#loginModalBtn");
const registerModalBtn = document.querySelector("#registerModalBtn");
const loginBtn = document.querySelector("#loginBtn");
const registerUserBtn = document.querySelector("#registerUserBtn");

//query selectors elements
const loginSection = document.querySelector("#loginSection");
const loginModal = document.querySelector("#loginModal");
const registerModal = document.querySelector("#registerModal");
const bookSection = document.querySelector("#bookSection");
const overlayContainer = document.querySelector("#overlayContainer");
const userNav = document.querySelector("#userNav");
const currentUserName = document.querySelector("#currentUserName");

//query selectors user input elements
//register
const usernameInput = document.querySelector("#usernameInput");
const userEmailInput = document.querySelector("#userEmailInput");
const userPasswordInput = document.querySelector("#userPasswordInput");

//login
const identifierInput = document.querySelector("#identifierInput");
const passwordInput = document.querySelector("#passwordInput");

// current user and jwt
let token = sessionStorage.getItem("token") || "";
let currentUser = JSON.parse(sessionStorage.getItem("user")) || {};
// toggle modals
const toggleModal = (modal, button, overlay) => {
  modal.classList.toggle("hidden");
  button.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
};

// theme functions
// get theme from strapi
const getTheme = async () => {
  let response = await axios.get("http://localhost:1337/api/webpage");
  let pickedTheme = response.data.data.attributes.colorTheme;
  return pickedTheme;
};
// apply color theme to webpage
const applyTheme = async () => {
  let theme = await getTheme();
  console.log(theme);
  document.body.classList.add(`${theme}`);
};

// get books from api

const getBooks = async () => {
  let response = await axios.get("http://localhost:1337/api/books?populate=*");
  return response.data.data;
};

const createBookCard = (array) => {
  array.forEach((element) => {
    const article = document.createElement("article");
    const title = document.createElement("h3");
    const spanContainer = document.createElement("div");
    const author = document.createElement("span");
    const pages = document.createElement("span");
    const rating = document.createElement("span");
    const release = document.createElement("span");
    const cover = document.createElement("img");
    article.classList.add("book-card");
    cover.setAttribute(
      "src",
      `http://localhost:1337${element.attributes.cover.data.attributes.url}`
    );
    title.textContent = element.attributes.title;
    spanContainer.classList.add("book-info");
    author.textContent = element.attributes.author;
    pages.textContent = `${element.attributes.pages} pages`;
    release.textContent = `Release: ${element.attributes.release}`;
    if (element.attributes.rating == null) {
      rating.textContent = `Rating: Not yet rated!`;
    } else {
      rating.textContent = `Rating: ${element.attributes.rating}/10`;
    }
    spanContainer.append(author, pages, release, rating);
    article.append(cover, title, spanContainer);
    bookSection.append(article);
  });
};

const renderBooks = async () => {
  let books = await getBooks();
  console.log(books);
  createBookCard(books);
};

// load webpage
const renderPage = async () => {
  await applyTheme();
  await renderBooks();
};

// register user
const registerUser = async (username, email, password) => {
  await axios
    .post("http://localhost:1337/api/auth/local/register", {
      username: username,
      email: email,
      password: password,
    })
    .then((response) => {
      console.log("Registration successful!");
      console.log("User profile", response.data.user);
      console.log("User token", response.data.jwt);
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    })
    .then((response) => {
      console.log(response);
      logIn(username, password);
      userNav.classList.toggle("hidden");
      loginSection.classList.add("hidden");
    });
  currentUserName.innerHTML = username;
};

// login
const logIn = async (identifier, password) => {
  await axios
    .post("http://localhost:1337/api/auth/local", {
      identifier: identifier,
      password: password,
    })
    .then((response) => {
      console.log("Log in successful!");
      console.log("User profile", response.data.user);
      console.log("User token", response.data.jwt);
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    });
};

renderPage();

// event listeners

loginModalBtn.addEventListener("click", () => {
  toggleModal(loginModal, loginModalBtn, overlayContainer);
});

loginBtn.addEventListener("click", async () => {
  toggleModal(loginModal, loginModalBtn, overlayContainer);
  await logIn(identifierInput.value, passwordInput.value);
  userNav.classList.toggle("hidden");
  currentUserName.innerHTML = currentUser.username;
  loginSection.classList.add("hidden");
});

registerModalBtn.addEventListener("click", () => {
  toggleModal(registerModal, registerModalBtn, overlayContainer);
});

registerUserBtn.addEventListener("click", async () => {
  await registerUser(
    usernameInput.value,
    userEmailInput.value,
    userPasswordInput.value
  );
  toggleModal(registerModal, registerModalBtn, overlayContainer);
});
