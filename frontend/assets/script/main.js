// query selectors buttons
const loginModalBtn = document.querySelector("#loginModalBtn");
const registerModalBtn = document.querySelector("#registerModalBtn");
const loginBtn = document.querySelector("#loginBtn");
const registerUserBtn = document.querySelector("#registerUserBtn");

//query selectors elements
const loginModal = document.querySelector("#loginModal");
const registerModal = document.querySelector("#registerModal");

const toggleModal = (modal, button) => {
  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
    button.classList.add("hidden");
  } else {
    modal.classList.add("hidden");
    button.classList.remove("hidden");
  }
};
const renderPage = () => {};

// event listeners

loginModalBtn.addEventListener("click", () => {
  toggleModal(loginModal, loginModalBtn);
});
loginBtn.addEventListener("click", () => {
  toggleModal(loginModal, loginModalBtn);
});
registerModalBtn.addEventListener("click", () => {
  toggleModal(registerModal, registerModalBtn);
});
registerUserBtn.addEventListener("click", () => {
  toggleModal(registerModal, registerModalBtn);
});
