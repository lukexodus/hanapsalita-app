import pool from "$lib/db.js"
import { removeNonAlphabet } from "$lib/utils.js"

export async function load({ url }) {
    let input = url.searchParams.get("w") ?? null;


}