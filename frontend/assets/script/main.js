// query selectors buttons
/*login and register*/
const loginModalBtn = document.querySelector("#loginModalBtn");
const registerModalBtn = document.querySelector("#registerModalBtn");
const loginBtn = document.querySelector("#loginBtn");
const registerUserBtn = document.querySelector("#registerUserBtn");
const closeBtns = document.querySelectorAll(".close-button");
/*search*/
const searchBtn = document.querySelector("#searchBtn");

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
const errorMsgLogin = document.querySelector("#errorMsgLogin");
/*register*/
const registerModal = document.querySelector("#registerModal");
const errorMsgRegister = document.querySelector("#errorMsgRegister");
/*startpage*/
const bookSection = document.querySelector("#bookSection");
const bookSectionContainer = document.querySelector("#bookSectionContainer");
const toastNotification = document.getElementById("toastNotification");
const bookSectionH2 = document.querySelector("#bookSectionH2");
const bookSectionH3 = document.querySelector("#bookSectionH3");
/*logged in mode*/
const userPageContainer = document.querySelector("#userPageContainer");
const userReadingList = document.querySelector("#userReadingList");
const userRatedList = document.querySelector("#userRatedList");
const overlayContainer = document.querySelector("#overlayContainer");
const userNav = document.querySelector("#userNav");
const currentUserName = document.querySelector("#currentUserName");
const ratingModal = document.querySelector("#ratingModal");
const bottomRow = document.querySelector("#bottomRow");

//query selectors user input elements
/*register*/
const usernameInput = document.querySelector("#usernameInput");
const userEmailInput = document.querySelector("#userEmailInput");
const userPasswordInput = document.querySelector("#userPasswordInput");
/*login*/
const identifierInput = document.querySelector("#identifierInput");
const passwordInput = document.querySelector("#passwordInput");
/*search*/
const searchInput = document.querySelector("#searchInput");

// current user and jwt
let token;
let currentUser;
let currentBook;

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
  document.body.classList.add(`${theme}`);
  overlayContainer.classList.add(`${theme}`);
};

// get books from api
const getBooks = async () => {
  let response = await axios.get("http://localhost:1337/api/books?populate=*");
  return response.data.data;
};
// search function
const bookSearch = async (input) => {
  let response = await axios.get("http://localhost:1337/api/books?populate=*", {
    params: {
      filters: {
        $or: [
          { author: { $contains: input } },
          { title: { $contains: input } },
        ],
      },
    },
  });
  return response.data.data;
};
// change headings
const changeHeadings = (heading1, heading2, text1, text2) => {
  heading1.innerHTML = text1;
  heading2.innerHTML = text2;
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
    cover.setAttribute("alt", "book-cover");
    title.textContent = element.attributes.title;
    spanContainer.classList.add("book-info");
    author.textContent = `by ${element.attributes.author}`;
    pages.textContent = `Pages: ${element.attributes.pages}`;
    release.textContent = `Publication date: ${element.attributes.release}`;
    if (element.attributes.average_rating == null) {
      rating.textContent = `Rating: Not yet rated!`;
    } else {
      let rounded = Math.round(element.attributes.average_rating * 10);
      rating.textContent = `Rating: ${rounded / 10}/5`;
    }
    // let userId = JSON.parse(sessionStorage.getItem("user")).id || "test";
    let btnContainer = createBookBtns(element.id);
    spanContainer.append(author, release, pages, rating);
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
  readListBtn.innerHTML = `Add to reading list <i class="fa-solid fa-glasses"></i>`;
  readListBtn.addEventListener("click", async () => {
    if (currentUser == null || currentUser == undefined) {
      showToast("Log in or register to create a reading list!");
    } else {
      await addToReadList(bookId);
    }
  });
  rateBtn.innerHTML = `Rate this book <i class="fa-solid fa-star"></i>`;
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
  let response = await axios.get(
    "http://localhost:1337/api/users/me?populate=deep,4",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let addedBooks = response.data.toreads.flatMap((item) =>
    item.books.map((book) => book.id)
  );
  let userId = currentUser.id;
  if (!addedBooks.includes(bookId)) {
    await axios.post(
      "http://localhost:1337/api/toreads",
      {
        data: {
          books: bookId,
          user: userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    showToast("The book was added to your reading list!");
  } else {
    showToast("The book is already in your reading list!");
  }
};

// remove book from reading list
const removeFromReadList = async (id) => {
  await axios.delete(`http://localhost:1337/api/toreads/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
};
// sort a read or rated list
const sortList = (array, sortBy) => {
  if (sortBy === "rating") {
    array.sort((a, b) => {
      const sortByB = b.userRating;
      const sortByA = a.userRating;
      if (sortByB < sortByA) return -1;
      if (sortByB > sortByA) return 1;
      return 0;
    });
  } else {
    array.sort((a, b) => {
      const sortByA = a.books[0][sortBy].toLowerCase();
      const sortByB = b.books[0][sortBy].toLowerCase();
      if (sortByA < sortByB) return -1;
      if (sortByA > sortByB) return 1;
      return 0;
    });
  }
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
  switch (sort) {
    case "title":
      sortList(dataArray, "title");
      break;
    case "author":
      sortList(dataArray, "author");
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
  let response = await axios.get(
    "http://localhost:1337/api/users/me?populate=deep,3",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let ratedBooks = response.data.ratings.flatMap((item) =>
    item.books.map((book) => book.id)
  );
  let userId = currentUser.id;
  if (!ratedBooks.includes(bookId)) {
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
    showToast("The rating was added!");
  } else {
    showToast("You already rated this book!");
  }
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
  let allratings = data.attributes.ratings.data.map(
    (book) => book.attributes.userRating
  );
  const sum = allratings.reduce((acc, curr) => acc + curr, 0);
  const count = allratings.length;
  const average = sum / count;
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
//render user rated list
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
  const dataArray = response.data.ratings;
  switch (sort) {
    case "title":
      sortList(dataArray, "title");
      break;
    case "author":
      sortList(dataArray, "author");
      break;
    case "rating":
      sortList(dataArray, "rating");
    default:
      dataArray;
  }
  dataArray.forEach((object) => {
    let bookDiv = document.createElement("div");
    bookDiv.classList.add(`book-card`, `rating-${object.id}`);
    let title = document.createElement("h3");
    title.textContent = object.books[0].title;
    let author = document.createElement("p");
    author.textContent = `by ${object.books[0].author}`;
    let rating = document.createElement("p");
    rating.textContent = `Your rating: ${object.userRating} / 5`;
    bookDiv.append(title, author, rating);
    userRatedList.append(bookDiv);
  });

};

// render books
const renderBooks = async () => {
  let books = await getBooks();
  createBookCard(books);
};

// load webpage
const renderPage = async () => {
  await applyTheme();
  await renderBooks();
};

// register user
const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(
      "http://localhost:1337/api/auth/local/register",
      {
        username: username,
        email: email,
        password: password,
      }
    );
    if (response.data.jwt && response.data.user) {
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      return "success";
    } else {
      throw new Error("Invalid Response");
    }
  } catch (err) {
    let fail = err.response.data.error.message;
    return fail;
  }
};

// log in new user after register
const postRegisterLogin = async (username, email, password) => {
  let response = await registerUser(username, email, password);
  if (response === "success") {
    logIn(username, password);
    userNav.classList.toggle("hidden");
    loginSection.classList.add("hidden");
    toggleModal(registerModal, overlayContainer);
    currentUserName.innerHTML = `${username}!`;
    renderBooks();
  } else {
    errorMsgRegister.innerHTML = response;
  }
};

// login
const logIn = async (identifier, password) => {
  try {
    const response = await axios.post("http://localhost:1337/api/auth/local", {
      identifier: identifier,
      password: password,
    });
    if (response.data.jwt && response.data.user) {
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      currentUserName.innerHTML = `${response.data.user.username}!`;
      renderBooks();
      currentUser = JSON.parse(sessionStorage.getItem("user"));
      return "success";
    } else {
      throw new Error("Invalid Response");
    }
  } catch (err) {
    let fail = err.response.data.error.message;
    return fail;
  }
};

// render page on load
renderPage();

// event listeners
// login and register
loginModalBtn.addEventListener("click", () => {
  toggleModal(loginModal, overlayContainer);
});

loginBtn.addEventListener("click", async () => {
  const response = await logIn(identifierInput.value, passwordInput.value);
  if (response === "success") {
    userNav.classList.toggle("hidden");
    loginSection.classList.toggle("hidden");
    const btnContainers = document.querySelectorAll(".book-buttons");
    btnContainers.forEach((container) => {
      container.classList.toggle("hidden");
    });
    toggleModal(loginModal, overlayContainer);
  } else {
    errorMsgLogin.innerHTML = response;
  }
});

registerModalBtn.addEventListener("click", () => {
  toggleModal(registerModal, overlayContainer);
});

registerUserBtn.addEventListener("click", async () => {
  await postRegisterLogin(
    usernameInput.value,
    userEmailInput.value,
    userPasswordInput.value
  );
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
    const spanElement = event.target.parentElement.querySelector("span");
    if (spanElement) {
      spanElement.innerHTML = "";
    }
  });
});
// logged in navigation
homeBtn.addEventListener("click", async () => {
  await renderBooks();
  bookSectionContainer.classList.remove("hidden");
  userPageContainer.classList.add("hidden");
  bottomRow.classList.remove("hidden");
});

myPageBtn.addEventListener("click", async () => {
  bookSectionContainer.classList.add("hidden");
  userPageContainer.classList.remove("hidden");
  bottomRow.classList.add("hidden");
  await getReadList("default");
  await getRatedList();
});

logOutBtn.addEventListener("click", () => {
  location.reload();
  sessionStorage.clear();
});

// sort reading list
sortTitleBtn.addEventListener("click", async () => {
  await getReadList("title");
});

sortAuthorBtn.addEventListener("click", async () => {
  await getReadList("author");
});


addRatingBtn.addEventListener("click", async () => {
  const selectedRating = document.querySelector('input[name="rating"]:checked');
  await addRating(currentBook, selectedRating.value);
  await calulateRating(currentBook);
  toggleModal(ratingModal, overlayContainer);
  await renderBooks();
});

// sort rated list
sortTitleBtn2.addEventListener("click", async () => {
  await getRatedList("title");
});

sortAuthorBtn2.addEventListener("click", async () => {
  await getRatedList("author");
});

sortRatingBtn.addEventListener("click", async () => {
  await getRatedList("rating");
});
// search
searchBtn.addEventListener("click", async () => {
  let userInput = searchInput.value;
  let response = await bookSearch(userInput);
  if (response.length >= 1) {
    createBookCard(response);
    changeHeadings(
      bookSectionH2,
      bookSectionH3,
      "Search results",
      `${response.length} book(s) found!`
    );
  } else {
    showToast("No matching results found!");
    bookSection.innerHTML = "";
    changeHeadings(
      bookSectionH2,
      bookSectionH3,
      "Search results",
      `${response.length} book(s) found!`
    );
    setTimeout(async () => {
      await renderBooks();
      changeHeadings(
        bookSectionH2,
        bookSectionH3,
        "Our books",
        `Recently added`
      );
    }, 3000);
  }
});
