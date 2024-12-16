import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
    if (url.pathname == '/') {
        console.log("redirecting")
        return redirect(302, '/search-by-parts');
    }
}