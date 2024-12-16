import { dataState } from "../routes/state.svelte";

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