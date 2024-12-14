import pool from "$lib/db.js"
import { purifyWord } from "$lib/utils.js"

export async function load({ url }) {
    let startsWith = url.searchParams.get("startsWith") ?? null;
	let contains = url.searchParams.get("contains") ?? null;
	let endsIn = url.searchParams.get("endsIn") ?? null;

	let strict = false;  // If a hyphen or an apostrophe is included in at least one input
	let filtersNum = 0;  // The number of filters used
	let stringsArray = [];  // Array of strings (to be joined), with which the presence of ' or - is checked

	// Counts the filters, and
	// forms the `stringsArray`
	if (startsWith) {
		filtersNum++;
		stringsArray.push(startsWith)
	}
	if (contains) {
		filtersNum++;
		stringsArray.push(contains)
	}
	if (endsIn) {
		filtersNum++;
		stringsArray.push(endsIn)
	}

	if (filtersNum == 0) {
		return { state: 0 };
	}

	let bufferString = stringsArray.join("");
	if (bufferString.includes('-') || bufferString.includes("'")) {
		strict = true;
	}

	// If there are no hyphens or apostrophes,
	// cleans the inputs once more
	// - removes all non-letter chars
	if (!strict) {
		if (startsWith) {startsWith = purifyWord(startsWith)}
		if (contains) {contains = purifyWord(contains)}
		if (endsIn) {endsIn = purifyWord(endsIn)}
	}

	let keywordColumn = strict ? "keyword_strict" : "keyword_not_strict";

	console.log(`strict ${strict}`)

	// Form the SQL query
	if (filtersNum == 1) {
		let matchQuery = "";
		if (startsWith) {
			matchQuery = startsWith + "%";
		}
		else if (contains) {
			matchQuery = "%" + contains + "%"
		}
		else if (endsIn) {
			matchQuery = "%" + endsIn;
		}

		let queryString = 'SELECT `word`, `lang`, `length`, `category`, `verb_base_form` FROM `words` WHERE `lang` = "T" AND ' + keywordColumn + ' LIKE ? ORDER BY `length` DESC, `word` LIMIT 5';
		try {
			let [rows] = await pool.query(queryString, [matchQuery]);

			return { state: 1, data: rows }
		} catch (error) {
			console.error("sbt | f1 | sql query error", error)
			return { state: 1, data: null }
		}
	} else if (filtersNum == 2) {
		let queryString = ""
	} else if (filtersNum == 3) {
		let queryString = ""
	}

	console.log("success")
}