import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //1. Loading recipe
    await model.loadRecipe(id);

    //2. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
}

async function controlSearchResults() {
  try {
    resultsView.renderSpinner();
    // Get search results
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResults(query);

    // Render results
    resultsView.render(model.getSearchResultsPage());

    // Render inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
}

function controlPagination(pageNumber) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(pageNumber));
  // Render pagination buttons
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  //Update recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe view
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update UI
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // Display sucess message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('⛔️', err);
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();
