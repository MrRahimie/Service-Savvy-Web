const wrapper = document.querySelector(".wrapper");

const btnPopup = document.querySelector(".btnLogin-popup");
const btnPopup2 = document.querySelector(".btnLogin-popup2");
btnPopup.addEventListener("click", () => {
  wrapper.classList.add("active-popup");
});
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

//first login
document.addEventListener("DOMContentLoaded", function () {
  const overlayContainer = document.querySelector(".overlay-container");

  document
    .querySelector(".btnLogin-popup")
    .addEventListener("click", function () {
      overlayContainer.classList.toggle("active");
      wrapper.classList.toggle("overlay-active");
    });
});
btnPopup.addEventListener("click", () => {
  container.classList.add("active-popup");
});
//sec login
document.addEventListener("DOMContentLoaded", function () {
  const overlayContainer = document.querySelector(".overlay-container");

  document
    .querySelector(".btnLogin-popup2")
    .addEventListener("click", function () {
      overlayContainer.classList.toggle("active");
      wrapper.classList.toggle("overlay-active");
    });
});
btnPopup2.addEventListener("click", () => {
  container.classList.add("active-popup");
});

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});
