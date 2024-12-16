import { json } from '@sveltejs/kit';
import db from "$lib/db.js"

export function GET({ url }) {
	let startsWith = url.searchParams.get("startsWith") ?? null;
	let contains = url.searchParams.get("contains") ?? null;
	let endsIn = url.searchParams.get("endsIn") ?? null;



	return json({message: 'hello'});
}
