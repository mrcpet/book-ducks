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
const addRatingBtn = document.querySelector("#addRatingBtn");
const sortTitleBtn2 = document.querySelector("#sortTitleBtn2");
const sortAuthorBtn2 = document.querySelector("#sortAuthorBtn2");
const sortRatingBtn = document.querySelector("#sortRatingBtn");

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
const userPageContainer = document.querySelector("#userPageContainer");
const userReadingList = document.querySelector("#userReadingList");
const userRatedList = document.querySelector("#userRatedList");
const overlayContainer = document.querySelector("#overlayContainer");
const userNav = document.querySelector("#userNav");
const currentUserName = document.querySelector("#currentUserName");
const ratingModal = document.querySelector("#ratingModal");

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
let currentBook;
// console.log("current token:", token, "current user:", currentUser);
// toggle modals //todo rewrite into general toggle function?
const toggleModal = (modal, overlay) => {
  modal.classList.toggle("hidden");
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
  // console.log(theme);
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
    if (element.attributes.average_rating == null) {
      rating.textContent = `Rating: Not yet rated!`;
    } else {
      let rounded = Math.round(element.attributes.average_rating * 10);
      rating.textContent = `Rating: ${rounded / 10}/5`;
    }
    // let userId = JSON.parse(sessionStorage.getItem("user")).id || "test";
    let btnContainer = createBookBtns(element.id);
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
    if (currentUser == null || currentUser == undefined) {
      showToast("Log in or register to create a reading list!");
    } else {
      await addToReadList(bookId);
      showToast("The book was added to your reading list!");
    }
  });
  rateBtn.textContent = "Rate this book";
  rateBtn.addEventListener("click", () => {
    if (currentUser == null || currentUser == undefined) {
      showToast("Log in or register to rate a book!");
    } else {
      toggleModal(ratingModal, overlayContainer);
      currentBook = bookId;
    }
    // await addRatingFunction; //todo write this function
  });
  btnContainer.append(readListBtn, rateBtn);
  return btnContainer;
};

// show toast function
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
    // console.log("Log in to create a reading list!"); //tell user to log in
  }
  let userId = loggedInUser.id;
  // console.log(userId);
  //todo test data: { booksToRead: {connect: [bookId] }} with put request directly to user, no toreads
  await axios.post(
    "http://localhost:1337/api/toreads",
    {
      data: {
        books: bookId,
        // bookId: bookId,
        user: userId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  // console.log("wow its working?");
  // console.log(bookId, loggedInUser.id);
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
  // console.log("sorted", array);
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
  console.log("read list deep 4: ", response.data);
  const dataArray = response.data.toreads;
  //todo rewrite this with /api/:pluralApiId?sort=value
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

//add rating
const addRating = async (bookId, userRating) => {
  let loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  if (loggedInUser == null) {
    // console.log("Log in to create a reading list!"); //tell user to log in
  }
  let userId = loggedInUser.id;
  // console.log(userId);
  await axios.post(
    "http://localhost:1337/api/ratings",
    {
      data: {
        books: bookId.toString(),
        userRating: userRating,
        user: userId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
};

//calculate and put rating
const calulateRating = async (bookId) => {
  let response = await axios.get(
    `http://localhost:1337/api/books/${bookId}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let data = response.data.data;
  console.log(data);
  let allratings = data.attributes.ratings.data.map(
    (book) => book.attributes.userRating
  );
  console.log("allratings:", allratings);
  const sum = allratings.reduce((acc, curr) => acc + curr, 0);
  console.log("sum", sum);
  const count = allratings.length;
  const average = sum / count;
  console.log("average rating:", average);
  await axios.put(
    `http://localhost:1337/api/books/${bookId}`,
    {
      data: {
        average_rating: average,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
};

const getRatedList = async (sort) => {
  userRatedList.innerHTML = "";
  let response = await axios.get(
    "http://localhost:1337/api/users/me?populate=deep,3",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let response2 = await axios.get(
    "http://localhost:1337/api/users/me?populate=deep,4",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log("rated list deep 3: ", response.data);
  console.log("populate deep 4:", response2.data);
  const dataArray = response.data.ratings;
  dataArray.forEach((object) => {
    let bookDiv = document.createElement("div");
    bookDiv.classList.add(`book-card`, `rating-${object.id}`);
    // let cover = document.createElement("img");
    // cover.setAttribute(
    //   "src",
    //   `http://localhost:1337${object.books[0].cover.url}`,
    //   "alt",
    //   `${object.books[0].title}`
    // );
    let title = document.createElement("h3");
    title.textContent = object.books[0].title;
    let author = document.createElement("p");
    author.textContent = `by ${object.books[0].author}`;
    let rating = document.createElement("p");
    rating.textContent = `Your rating: ${object.userRating} / 5`;
    bookDiv.append(title, author, rating);
    userRatedList.append(bookDiv);
  });
  // const dataArray = response.data.ratings.map((rating) => rating.id);
  // console.log(dataArray);
  // dataArray.forEach(async (rating) => {
  //   let response = await axios.get(
  //     `http://localhost:1337/api/ratings/${rating}?populate=*`
  //   );
  //   console.log("response mapped rating", response);
  // });
};

// render books
const renderBooks = async () => {
  let books = await getBooks();
  // console.log(books);
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
      // console.log("Registration successful!");
      // console.log("User profile", response.data.user);
      // console.log("User token", response.data.jwt);
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    })
    .then((response) => {
      // console.log(response);
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
      // console.log("Log in successful!");
      // console.log("User profile", response.data.user);
      // console.log("User token", response.data.jwt);
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      currentUserName.innerHTML = `${response.data.user.username}!`;
      renderBooks();
      currentUser = JSON.parse(sessionStorage.getItem("user"));
    });
};

// render page on load
renderPage();

// event listeners
loginModalBtn.addEventListener("click", () => {
  toggleModal(loginModal, overlayContainer);
});

loginBtn.addEventListener("click", async () => {
  toggleModal(loginModal, overlayContainer);
  await logIn(identifierInput.value, passwordInput.value);
  userNav.classList.toggle("hidden");
  loginSection.classList.toggle("hidden");
  const btnContainers = document.querySelectorAll(".book-buttons");
  btnContainers.forEach((container) => {
    container.classList.toggle("hidden");
  });
});

registerModalBtn.addEventListener("click", () => {
  toggleModal(registerModal, overlayContainer);
});

registerUserBtn.addEventListener("click", async () => {
  await registerUser(
    usernameInput.value,
    userEmailInput.value,
    userPasswordInput.value
  );
  toggleModal(registerModal, overlayContainer);
});

closeBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.target.parentElement.classList.toggle("hidden");
    overlayContainer.classList.toggle("hidden");
    // loginBtn.classList.toggle("hidden");
    // if (event.target.parentElement === registerModal) {
    //   registerModalBtn.classList.toggle("hidden");
    // } else {
    //   loginModalBtn.classList.toggle("hidden");
    // }
  });
});

homeBtn.addEventListener("click", async () => {
  await renderBooks();
  bookSectionContainer.classList.remove("hidden");
  userPageContainer.classList.add("hidden");
});

myPageBtn.addEventListener("click", async () => {
  bookSectionContainer.classList.add("hidden");
  userPageContainer.classList.remove("hidden");
  await getReadList("default");
  await getRatedList();
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

addRatingBtn.addEventListener("click", async () => {
  const selectedRating = document.querySelector('input[name="rating"]:checked');
  console.log(selectedRating.value);
  console.log(currentBook);
  await addRating(currentBook, selectedRating.value);
  await calulateRating(currentBook);
  toggleModal(ratingModal, overlayContainer);
  showToast("The rating was added!");
  await renderBooks();
  /*skriv en funktion som hämtar alla ratings för currentbook och räknar ut medelvärdet, sedan gör en post till currentbook.averagerating*/
  // let response = await axios.get(
  //   "http://localhost:1337/api/ratings?populate=deep,4",
  //   {
  //     headers: {
  //       Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  //     },
  //   }
  // );
  // console.log(response);
});
