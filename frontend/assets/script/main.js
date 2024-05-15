// query selectors buttons
/*login and register*/
const loginModalBtn = document.querySelector("#loginModalBtn");
const registerModalBtn = document.querySelector("#registerModalBtn");
const loginBtn = document.querySelector("#loginBtn");
const registerUserBtn = document.querySelector("#registerUserBtn");
const closeBtns = document.querySelectorAll(".close-button");
/*logged in mode*/
const homeBtn = document.querySelector("#homeBtn");
const logOutBtn = document.querySelector("#logOutBtn");
const myPageBtn = document.querySelector("#myPageBtn");
const sortTitleBtn = document.querySelector("#sortTitleBtn");
const sortAuthorBtn = document.querySelector("#sortAuthorBtn");

//query selectors elements
/*login*/
const loginSection = document.querySelector("#loginSection");
const loginModal = document.querySelector("#loginModal");
const registerModal = document.querySelector("#registerModal");
/*startpage*/
const bookSection = document.querySelector("#bookSection");
const bookSectionContainer = document.querySelector("#bookSectionContainer");
const toastNotification = document.getElementById("toastNotification");
/*logged in mode*/
const userPageSection = document.querySelector("#userPageSection");
const userReadingList = document.querySelector("#userReadingList");
const overlayContainer = document.querySelector("#overlayContainer");
const userNav = document.querySelector("#userNav");
const currentUserName = document.querySelector("#currentUserName");

//query selectors user input elements
/*register*/
const usernameInput = document.querySelector("#usernameInput");
const userEmailInput = document.querySelector("#userEmailInput");
const userPasswordInput = document.querySelector("#userPasswordInput");
/*login*/
const identifierInput = document.querySelector("#identifierInput");
const passwordInput = document.querySelector("#passwordInput");

// current user and jwt
let token;
let currentUser;
console.log("current token:", token, "current user:", currentUser);
// toggle modals //todo rewrite into general toggle function?
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
// create book card for start page
const createBookCard = (array) => {
  bookSection.innerHTML = "";
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
    // let userId = JSON.parse(sessionStorage.getItem("user")).id || "test";
    let btnContainer = createBookBtns(element.id);
    // console.log("TESTING", element.id, JSON.parse(sessionStorage.getItem("user")).id)
    spanContainer.append(author, pages, release, rating);
    article.append(cover, title, spanContainer, btnContainer);
    bookSection.append(article);
  });
};
// create buttons for book cards
const createBookBtns = (bookId) => {
  const readListBtn = document.createElement("button");
  const rateBtn = document.createElement("button");
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("book-buttons");
  readListBtn.textContent = "Add to reading list";
  readListBtn.addEventListener("click", async () => {
    await addToReadList(bookId);
    showToast("The book was added to your reading list!");
  });
  rateBtn.textContent = "Rate this book";
  btnContainer.append(readListBtn, rateBtn);
  return btnContainer;
};
const showToast = (text) => {
  // Display the toast notification
  toastNotification.innerHTML = text;
  toastNotification.style.display = "block";

  // Hide the toast notification after 3 seconds (adjust as needed)
  setTimeout(() => {
    toastNotification.style.display = "none";
  }, 3000);
};
// add book to user reading list
const addToReadList = async (bookId) => {
  let loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  if (loggedInUser == null) {
    console.log("Log in to create a reading list!"); //tell user to log in
  }
  let userId = loggedInUser.id;
  console.log(userId);
  await axios.post(
    "http://localhost:1337/api/toreads",
    {
      data: {
        books: bookId,
        bookId: bookId,
        user: userId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log("wow its working?");
  console.log(bookId, loggedInUser.id);
};
// remove book from reading list
const removeFromReadList = async (id) => {
  await axios.delete(`http://localhost:1337/api/toreads/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
};
const sortReadingList = (array, sortBy) => {
  array.sort((a, b) => {
    const sortByA = a.books[0][sortBy].toLowerCase();
    const sortByB = b.books[0][sortBy].toLowerCase();
    if (sortByA < sortByB) return -1;
    if (sortByA > sortByB) return 1;
    return 0;
  });
  console.log("sorted", array);
};
// get user reading list and render
const getReadList = async (sort) => {
  userReadingList.innerHTML = "";
  let response = await axios.get(
    "http://localhost:1337/api/users/me?populate=deep,4",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  const dataArray = response.data.toreads;
  console.log(dataArray);
  // let sortedByTitle = dataArray.sort((a, b) => {
  //   const titleA = a.books[0].title.toLowerCase();
  //   const titleB = b.books[0].title.toLowerCase();
  //   if (titleA < titleB) return -1;
  //   if (titleA > titleB) return 1;
  //   return 0;
  // });
  switch (sort) {
    case "title":
      sortReadingList(dataArray, "title");
      break;
    case "author":
      sortReadingList(dataArray, "author");
      break;
    default:
      dataArray;
  }
  // console.log(sortedByTitle);
  dataArray.forEach((object) => {
    let bookDiv = document.createElement("div");
    bookDiv.classList.add(`book-card`, `toread-${object.id}`);
    let cover = document.createElement("img");
    cover.setAttribute(
      "src",
      `http://localhost:1337${object.books[0].cover.url}`,
      "alt",
      `${object.books[0].title}`
    );
    let title = document.createElement("h3");
    title.textContent = object.books[0].title;
    let author = document.createElement("p");
    author.textContent = `by ${object.books[0].author}`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove from list";
    removeBtn.addEventListener("click", async () => {
      await removeFromReadList(object.id);
      await getReadList();
    });
    bookDiv.append(cover, title, author, removeBtn);
    userReadingList.append(bookDiv);
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
  currentUserName.innerHTML = `${username}!`;
  renderBooks();
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
      currentUserName.innerHTML = `${response.data.user.username}!`;
      renderBooks();
    });
};

// render page on load
renderPage();

// event listeners

loginModalBtn.addEventListener("click", () => {
  toggleModal(loginModal, loginModalBtn, overlayContainer);
});

loginBtn.addEventListener("click", async () => {
  toggleModal(loginModal, loginModalBtn, overlayContainer);
  await logIn(identifierInput.value, passwordInput.value);
  userNav.classList.toggle("hidden");
  loginSection.classList.toggle("hidden");
  const btnContainers = document.querySelectorAll(".book-buttons");
  btnContainers.forEach((container) => {
    container.classList.toggle("hidden");
  });
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

closeBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.target.parentElement.classList.toggle("hidden");
    overlayContainer.classList.toggle("hidden");
    loginBtn.classList.toggle("hidden");
    if (event.target.parentElement === registerModal) {
      registerModalBtn.classList.toggle("hidden");
    } else {
      loginModalBtn.classList.toggle("hidden");
    }
  });
});

homeBtn.addEventListener("click", () => {
  bookSectionContainer.classList.remove("hidden");
  userPageSection.classList.add("hidden");
});

myPageBtn.addEventListener("click", async () => {
  bookSectionContainer.classList.add("hidden");
  userPageSection.classList.remove("hidden");
  await getReadList("default");
});
sortTitleBtn.addEventListener("click", async () => {
  await getReadList("title");
});
sortAuthorBtn.addEventListener("click", async () => {
  await getReadList("author");
});
logOutBtn.addEventListener("click", () => {
  // renderPage();
  location.reload();
  sessionStorage.clear();
  // userNav.classList.toggle("hidden");
  // loginSection.classList.toggle("hidden");
  //todo test with location.reload
});
