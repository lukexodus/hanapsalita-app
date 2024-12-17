import { dataState } from "../routes/state.svelte";
import { Stack } from "./data-structures.svelte";

export function resetHistoryStack() {
    if (dataState.historyStack) {
        dataState.historyStack.clear(); 
    } else {
        dataState.historyStack = new Stack();
    }

    if (dataState.undidHistoryStack) {
        dataState.undidHistoryStack.clear(); 
    } else {
        dataState.undidHistoryStack = new Stack();
    }
}

export function syncFavorites() {
    saveFavorites();
    loadFavorites();
}

export function saveFavorites() {
    if (dataState.favorites) {
        localStorage.setItem('favorites', JSON.stringify(Array.from(dataState.favorites)));
    }
}

export function loadFavorites() {
    let favoritesData = JSON.parse(localStorage.getItem('favorites')) ?? null;
    if (favoritesData) {
        dataState.favorites = new Set(favoritesData);
    }
}

export function syncFavoriteMode() {
    let favoriteModeLocal = localStorage.getItem("favoriteMode");
    if (!favoriteModeLocal) {
        localStorage.setItem("favoriteMode", dataState.favoriteMode);
    } else {
        dataState.favoriteMode = favoriteModeLocal;
    }
}