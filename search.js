(function () {
    const MIN_CHARS = 2;
    const MAX_RESULTS = 6;

    function getScriptEl() {
        return document.currentScript || document.querySelector('script[src*="site-search.js"]');
    }

    function getBaseUrl() {
        const scriptEl = getScriptEl();
        if (!scriptEl || !scriptEl.src) return null;
        try {
            return new URL("./", scriptEl.src);
        } catch (e) {
            return null;
        }
    }

    const BASE = getBaseUrl();
    if (!BASE) return;

    function $(id) {
        return document.getElementById(id);
    }

    const input = $("site_search_input");
    const list = $("site_search_results");
    if (!input || !list) return;

    const INDEX = [
        { title: "Home", path: "index.html", keywords: ["home", "start", "tiger", "welcome", "main"] },
        { title: "Image Gallery", path: "gallery.html", keywords: ["gallery", "photos", "pictures", "images", "tiger photo"] },

        { title: "Habitat", path: "habitat.html", keywords: ["habitat", "home", "where", "forest", "jungle", "snow", "asia"] },
        { title: "Scientific Name and Classification", path: "classification.html", keywords: ["name", "scientific", "panthera", "tigris", "big cat", "family", "felidae"] },
        { title: "Diet Information", path: "diet.html", keywords: ["diet", "food", "eat", "meat", "hunt", "prey"] },
        { title: "Mating and Reproduction Information", path: "reproduction.html", keywords: ["babies", "cubs", "family", "mother", "reproduction", "growing"] },
        { title: "Anatomy and Biology", path: "anatomy.html", keywords: ["body", "paws", "claws", "teeth", "stripes", "tail", "size"] },
        { title: "Behavior", path: "behavior.html", keywords: ["behavior", "roar", "sleep", "alone", "territory", "moves"] },

        { title: "Indochinese Tiger Photo", path: "photos/indochinese_tiger.html", keywords: ["indochinese", "photo", "picture", "stripe", "tiger"] },
        { title: "South China Tiger Photo", path: "photos/south_china_tiger.html", keywords: ["south china", "south", "china", "photo", "picture", "tiger"] },
        { title: "Siberian Tiger Photo", path: "photos/siberian_tiger.html", keywords: ["siberian", "amur", "snow", "russia", "photo", "tiger"] },
        { title: "Bengal Tiger Photo", path: "photos/bengal_tiger.html", keywords: ["bengal", "india", "photo", "picture", "tiger"] }
    ];

    function norm(s) {
        return String(s || "").trim().toLowerCase();
    }

    function escapeHtml(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function hrefFor(path) {
        return new URL(path, BASE).toString();
    }

    function hideResults() {
        list.hidden = true;
        list.innerHTML = "";
        input.setAttribute("aria-expanded", "false");
    }

    function scoreItem(q, item) {
        const title = norm(item.title);
        const kws = (item.keywords || []).map(norm);

        let score = 0;

        if (title === q) score += 100;
        if (title.startsWith(q)) score += 60;
        if (title.includes(q)) score += 30;

        for (const kw of kws) {
            if (!kw) continue;
            if (kw === q) score += 80;
            else if (kw.startsWith(q)) score += 40;
            else if (kw.includes(q)) score += 15;
        }

        return score;
    }

    function findMatches(q) {
        return INDEX
            .map(function (item) {
                return { item: item, score: scoreItem(q, item) };
            })
            .filter(function (x) {
                return x.score > 0;
            })
            .sort(function (a, b) {
                return b.score - a.score;
            })
            .map(function (x) {
                return x.item;
            });
    }

    function render(matches) {
        if (!matches.length) return hideResults();

        const top = matches.slice(0, MAX_RESULTS);
        list.innerHTML = top
            .map(function (x) {
                return '<li><a href="' + hrefFor(x.path) + '">' + escapeHtml(x.title) + "</a></li>";
            })
            .join("");

        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
    }

    function goBestMatch() {
        const q = norm(input.value);
        if (q.length < MIN_CHARS) return hideResults();

        const matches = findMatches(q);
        if (matches.length) window.location.assign(hrefFor(matches[0].path));
        else hideResults();
    }

    hideResults();

    input.addEventListener("input", function () {
        const q = norm(input.value);
        if (q.length < MIN_CHARS) return hideResults();
        render(findMatches(q));
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            goBestMatch();
        }
        if (e.key === "Escape") {
            hideResults();
            input.blur();
        }
    });

    input.addEventListener("focus", function () {
        const q = norm(input.value);
        if (q.length < MIN_CHARS) hideResults();
        else render(findMatches(q));
    });

    input.addEventListener("blur", function () {
        setTimeout(hideResults, 140);
    });
})();
