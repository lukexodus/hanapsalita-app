import { fail } from '@sveltejs/kit';

import pool from "$lib/db.js"
import { removeNonAlphabet, sortWord, removeDuplicateChars } from "$lib/utils.js"

const invalidCharPattern = /[^a-zA-Z'-]/;

export const actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		let word = data.get('w');
		const category = data.get('c');
		const verbBaseForm = data.get('bf') ?? null;

        console.log(`w ${word}`)
        console.log(`c ${category}`)
        console.log(`bf ${verbBaseForm}`)

		// Form Validation

        if (!word) {
			console.error("Input invalid: Missing 'word'");
			return fail(400, { word, missingWord: true, mode: 1 });
		}

        if (category == "C" && !verbBaseForm) {
			console.error("Input invalid: Missing 'verbBaseForm' for category C");
            return fail(400, { word, missingBaseForm: true, mode: 1 });
        }

		if (invalidCharPattern.test(word)) {
			console.error("Input invalid: Word contains invalid characters");
			return fail(400, { word, wordContainsInvalid: true, mode: 1 });
		}
		if (category == 'C' && invalidCharPattern.test(verbBaseForm)) {
			console.error("Input invalid: Verb base contains invalid characters");
			return fail(400, { word, category, verbBaseForm, baseFormContainsInvalid: true, mode: 1 });
		}

		// Check if strict or not
		let strict = false;
		if (/['-]/.test(word)) {
			strict = true;
		}

		// Check if word already exists
		let checkQueryString = 'SELECT `id` FROM words WHERE ' + 
		(strict ? '`keyword_strict`' : '`keyword_not_strict`') + 
		' = ? LIMIT 1';
		try {
			const [rows] = await pool.query(checkQueryString, [word]);
			if (rows.length == 1) {
				console.log(`alredy exists ${word}`)
				return { word, alreadyExists: true, mode: 1 };
			} else {
				console.log("not already exists")
			}
		} catch (error) {
			console.error("aw | sql query error", error)
			return { success: false, mode: 1 }
		}


		// Terms guide:
		// pure (only alphabet chars)   == not strict (search)
		// with hyphens and apostrophes == strict (search)

		// Form the values of the record's different columns
		let wordPure = removeNonAlphabet(word);
		let lang = "T";
		let length = wordPure.length;
		let alphaSortedPure = sortWord(wordPure);
		let alphaSortedPureNoDuplicates = removeDuplicateChars(alphaSortedPure);
		let alphaSorted = sortWord(word);
		let alphaSortedNoDuplciates = removeDuplicateChars(alphaSorted);

		// Build the sql query string based on conditions
		let queryString = 'INSERT INTO `words` (`word`, `keyword_not_strict`, `keyword_strict`, `lang`, `length`, `category`' + 
		(category == "C" ? ', `verb_base_form`' : '') +
		', `alpha_sorted_not_strict`, `alpha_sorted_strict`, `alpha_sorted_no_duplicates_not_strict`, `alpha_sorted_no_duplicates_strict`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?' +
		(category == "C" ? ', ?' : '') + 
		')';

		let values = category == "C" ?
		 [word, wordPure, word, lang, length, category, verbBaseForm, alphaSortedPure, alphaSorted, alphaSortedPureNoDuplicates, alphaSortedNoDuplciates]
		 : [word, wordPure, word, lang, length, category, alphaSortedPure, alphaSorted, alphaSortedPureNoDuplicates, alphaSortedNoDuplciates];

		console.log(`queryString ${queryString}`)

		// Do the database operation
		try {
			let [results] = await pool.query(queryString, values);

			if (results.affectedRows == 1) {
				return { word, success: true, mode: 1 };
			} else {
				return { success: false, mode: 1 }
			}
		} catch (error) {
			console.error("aw | sql query error", error)
			return { success: false, mode: 1 }
		}
	},
	edit: async ({ request }) => {
		const data = await request.formData();
		const previousWordObj = data.get('pwo') ? JSON.parse(data.get('pwo')) : null;
		const newWord = data.get('new-word') ?? null;
		let category = data.get('category') ?? null;
		const verbBaseForm = data.get('bf') ?? null;

		let previousWord = previousWordObj.word;
		let wordID = previousWordObj.id;
		let previousCategory = previousWordObj.category;

		if (!category) {
			category = previousCategory;
		}

        console.log(`previousWordObj ${JSON.stringify(previousWordObj)}`)
        console.log(`newWord ${newWord}`)
        console.log(`c ${category}`)
        console.log(`bf ${verbBaseForm}`)

		// Form validation

        if (!previousWordObj) {
			console.error("Input invalid: Missing 'wordToEdit'");
			return fail(400, { missingWordToEdit: true, newWord, verbBaseForm, mode: 2 });
		}

        if (!newWord) {
			console.error("Input invalid: Missing 'newWord'");
			return fail(400, { missingNewWord: true, wordToEdit: previousWord, verbBaseForm, mode: 2 });
		}
        if (category == "C") {
			if (!verbBaseForm) {
				console.error("Input invalid: Missing 'verbBaseForm'");
            	return fail(400, { missingBaseForm: true, wordToEdit: previousWord, newWord, mode: 2 });
			}
			if (invalidCharPattern.test(verbBaseForm)) {
				console.error("Input invalid: Base form contains invalid characters");
				return fail(400, { wordToEdit: previousWord, newWord, verbBaseForm, baseFormContainsInvalid: true, mode: 1 });
			}
        }

		if (newWord == previousWord) {
			// Update only other attributes (category and verb base form if applied)...

			let queryString = null;
			let values = null;
			if (category == "C") {
				queryString = 'UPDATE `words` SET `category` = ?, `verb_base_form` = ? WHERE `id` = ?';
				values = [category, verbBaseForm, wordID]
			} else {
				queryString = 'UPDATE `words` SET `category` = ? WHERE `id` = ?';
				values = [category, wordID]
			}

			// Do the database operation
			try {
				let [results] = await pool.query(queryString, values);

				if (results.affectedRows == 1) {
					return { success: true, mode: 2 };
				} else {
					return { success: false, mode: 2 }
				}
			} catch (error) {
				console.error("ew | sql query error", error)
				return { success: false, mode: 2 }
			}
		} else {
			// If new word differs from the previous word by spelling...

			// Check if strict or not
			let strict = false;
			if (/['-]/.test(newWord)) {
				strict = true;
			}

			// Check if word already exists
			let checkQueryString = 'SELECT `id` FROM words WHERE ' + 
			(strict ? '`keyword_strict`' : '`keyword_not_strict`') + 
			' = ? LIMIT 1';
			try {
				const [rows] = await pool.query(checkQueryString, [newWord]);
				if (rows.length == 1) {
					console.log(`alredy exists ${newWord}`)
					return { newWord, alreadyExists: true, mode: 2 };
				} else {
					console.log("not already exists")
				}
			} catch (error) {
				console.error("ew | sql query error", error)
				return { success: false, mode: 2 }
			}

			// Delete old record
			try {
				let [results] = await pool.query('DELETE FROM `words` WHERE	`id` = ?', [wordID]);

				if (results.affectedRows != 1) {
					return { success: false, mode: 2 };
				}
			} catch (error) {
				console.error("ew | sql query error", error)
				return { success: false, mode: 2 }
			}
			// If there is no error, continue...

			// Create new record

			// Form the values of the record's different columns
			let wordPure = removeNonAlphabet(newWord);
			let lang = "T";
			let length = wordPure.length;
			let alphaSortedPure = sortWord(wordPure);
			let alphaSortedPureNoDuplicates = removeDuplicateChars(alphaSortedPure);
			let alphaSorted = sortWord(newWord);
			let alphaSortedNoDuplciates = removeDuplicateChars(alphaSorted);

			// Build the sql query string based on conditions
			let queryString = 'INSERT INTO `words` (`word`, `keyword_not_strict`, `keyword_strict`, `lang`, `length`, `category`' + 
			(category == "C" ? ', `verb_base_form`' : '') +
			', `alpha_sorted_not_strict`, `alpha_sorted_strict`, `alpha_sorted_no_duplicates_not_strict`, `alpha_sorted_no_duplicates_strict`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?' +
			(category == "C" ? ', ?' : '') + 
			')';

			let values = category == "C" ?
			[newWord, wordPure, newWord, lang, length, category, verbBaseForm, alphaSortedPure, alphaSorted, alphaSortedPureNoDuplicates, alphaSortedNoDuplciates]
			: [newWord, wordPure, newWord, lang, length, category, alphaSortedPure, alphaSorted, alphaSortedPureNoDuplicates, alphaSortedNoDuplciates];

			console.log(`queryString ${queryString}`)
			console.log(`values ${values}`)

			// Do the database operation
			try {
				let [results] = await pool.query(queryString, values);

				if (results.affectedRows == 1) {
					return { success: true, mode: 2 };
				} else {
					return { success: false, mode: 2 }
				}
			} catch (error) {
				console.error("ew | sql query error", error)
				return { success: false, mode: 2 }
			}
		}
	},
    delete: async ({ request }) => {
		const data = await request.formData();
		const word = data.get('w');

		// Check if strict or not
		let strict = false;
		if (/['-]/.test(word)) {
			strict = true;
		}

		// Check if word already exists
		let checkQueryString = 'SELECT `id` FROM words WHERE ' + 
		(strict ? '`keyword_strict`' : '`keyword_not_strict`') + 
		' = ? LIMIT 1';
		try {
			const [rows] = await pool.query(checkQueryString, [word]);
			if (rows.length != 1) {
				return { word, notExists: true, mode: 3 };
			}
		} catch (error) {
			console.error("dw | sql query error", error)
			return { success: false, mode: 3 }
		}

		// Delete word record
		try {
			let [results] = await pool.query('DELETE FROM `words` WHERE	`word` = ?', [word]);
			
			if (results.affectedRows == 1) {
				return { success: true, mode: 3, word };
			} else {
				return { success: false, mode: 3 };
			}
		} catch (error) {
			console.error("dw | sql query error", error)
			return { success: false, mode: 3 }
		}
	},
    check: async ({ request }) => {
		const data = await request.formData();
		const word = data.get('word-to-edit');

        console.log(`w ${word}`)

		// Form Validation

		if (!word) {
			console.error("Input invalid: Missing 'word'");
			return fail(400, { word, missingWord: true, mode: 4 });
		}

		if (invalidCharPattern.test(word)) {
			console.error("Input invalid: Word contains invalid characters");
			return fail(400, { word, wordContainsInvalid: true, mode: 4 });
		}

		// Check if strict or not
		let strict = false;
		if (/['-]/.test(word)) {
			strict = true;
		}

        // Form the sql query string based on conditions
		let queryString = 'SELECT `id`, `word`, `category`, `verb_base_form` FROM words WHERE ' + 
		(strict ? '`keyword_strict`' : '`keyword_not_strict`') + 
		' = ? LIMIT 1';

		// Do the operation
		try {
			const [rows] = await pool.query(queryString, [word]);
			if (rows.length == 1) {
				console.log(`exists '${word}'`)
				return { exists: true, mode: 4, wordObj: rows[0] };
			} else {
				return { word, exists: false, mode: 4 };
			}
		} catch (error) {
			console.error("cw | sql query error", error)
			return { success: false, mode: 4 }
		}
	}
};