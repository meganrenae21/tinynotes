import YAML from "yaml";
import { DateTime } from "luxon"

export const config = {
    dir: {
        input: "src",
        includes: "_includes",
        layouts: "_layouts",
        data: "_data",
        output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
}

export default function(eleventyConfig) {
	eleventyConfig.addGlobalData("permalink", () => {
		return (data) =>
			`${data.page.filePathStem}.${data.page.outputFileExtension}`;
	});

	eleventyConfig.addUrlTransform((page) => {
		if (page.url.endsWith(".html")) {
			return page.url.slice(0, -1 * ".html".length);
		}
	});

    eleventyConfig.addPassthroughCopy("src/css");

    eleventyConfig.addDataExtension("yml", (contents) => YAML.parse(contents))

    eleventyConfig.addCollection("tags", function (collectionsApi) {
        const tags = new Set();
        collectionsApi.getAll().forEach(function (item) {
            if ("tags" in item.data) {
                let tagsList = item.data.tags;
                if (typeof tagsList === "string") {
                    tagsList = [tagsList];
                }
                for (const tag of tagsList) {
                    tags.add(tag)
                }
            }
        })
        return [...tags].sort();
    })

    eleventyConfig.addCollection("years", function (collectionsApi) {
        const years = new Set();
        collectionsApi.getAll().forEach(function (item) {
            let year = DateTime.fromJSDate(item.date, {zone: "utc"}).toFormat("yyyy")
            years.add(year)
        })
        return [...years].sort().reverse();
    })

    eleventyConfig.addCollection("months", function () {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].reverse()
    })

    eleventyConfig.addCollection("PostsByYear", function (collectionsApi) {
        const notes = collectionsApi.getFilteredByGlob("src/notes/**.*")
        const collection = {}
        notes.forEach(function (item) {
            let year = DateTime.fromJSDate(item.date, {zone: "utc"}).toFormat("yyyy")
            if (!Object.hasOwn(collection, year)) {
                collection[year] = []
            }
            collection[year].push(item)
        })
        return collection
    })

    eleventyConfig.addCollection("PostsByYearMonth", function (collectionsApi) {
        const notes = collectionsApi.getFilteredByGlob("src/notes/**.*")
        const collection = []
        notes.forEach(function (item) {
            let year = DateTime.fromJSDate(item.date, {zone: "utc"}).toFormat("yyyy")
            let month = DateTime.fromJSDate(item.date, {zone: "utc"}).toFormat("LLLL")
            if (!collection.find(yearmonth => yearmonth.year === year && yearmonth.month === month)) {
                let newYearMonth = {
                    "year": year,
                    "month": month,
                    "notes": [item]
                }
                collection.push(newYearMonth)
            } else {
                let ym = collection.find(ym => ym.year === year && ym.month === month)
                ym.notes.push(item)
            }

        })
        return collection
    })

    eleventyConfig.addCollection("notes", function (collectionsApi) {
        return collectionsApi.getFilteredByGlob("src/notes/**.*")
    })

    eleventyConfig.addFilter("where", function(array, key, value) {
        return array.filter(item => item[key] === value)
    })

    eleventyConfig.addFilter("contains", function(array, value) {
        return array.includes(value);
    })

    eleventyConfig.addFilter("whereContains", function(array, keyArray, value) {
        return array.filter(item => item.data[keyArray]?.includes(value))
    })

    eleventyConfig.addFilter("shortDate", (dateObj) => {
        return DateTime
        .fromJSDate(dateObj, {zone: "utc"})
        .toFormat("yyyy-LL-dd")
    })
}
