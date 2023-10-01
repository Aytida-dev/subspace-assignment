const express = require("express");
const apiRouter = express.Router();
const axios = require("axios");
const _ = require("lodash");

async function fetchBlogData(dummyArgument) {
  try {
    const response = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );
    const data = response.data;
    return data.blogs;
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to fetch blog data");
  }
}

function getAnalyzeData(blogsData) {
  try {
    const totalBlogs = blogsData.length;
    const longestBlog = _.maxBy(blogsData, "title.length").title;
    const privacyBlogs = _.filter(blogsData, (blog) =>
      blog.title.toLowerCase().includes("privacy")
    ).length;
    const uniqueBlogsTitles = _.map(_.uniqBy(blogsData, "title"), "title");

    const analyzedData = {
      totalBlogs,
      longestBlog,
      privacyBlogs,
      uniqueBlogsTitles,
    };

    return analyzedData;
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to analyze data");
  }
}

function getQuerySearch(searchParam, blogsData) {
  try {
    const searchedBlogs = _.filter(blogsData, (blog) =>
      blog.title.toLowerCase().includes(searchParam.toLowerCase())
    );

    const searchResults = {
      searchedBlogs,
    };

    return searchResults;
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to search blogs");
  }
}

let dummyArgument = 0; //for cache invalidation after a set period of time
setInterval(() => {
  dummyArgument = Math.random();

  memoizedAnalyzeData.cache.clear();
  memoizedFetchBlogData.cache.clear();
  memoizedQuerySearch.cache.clear();
}, 300000); // time for cache expiration

const memoizedAnalyzeData = _.memoize(getAnalyzeData);
const memoizedQuerySearch = _.memoize(getQuerySearch);
const memoizedFetchBlogData = _.memoize(fetchBlogData);

apiRouter.get("/", (req, res) => {
  res.send({
    message: "blog api route working smoothly",
  });
});

apiRouter.get("/blog-stats", async (req, res) => {
  try {
    const blogsData = await memoizedFetchBlogData(dummyArgument);
    const analyzedData = memoizedAnalyzeData(blogsData);

    res.send({
      analyzedData,
    });
  } catch (error) {
    if (error.message === "Failed to fetch blog data") {
      res.status(500).send({
        message: "Failed to fetch blog data",
      });
    } else {
      res.status(500).send({
        message: "Failed to analyze data",
      });
    }
  }
});

apiRouter.get("/blog-search", async (req, res) => {
  try {
    const blogsData = await memoizedFetchBlogData(dummyArgument);
    const searchParam = req.query.query;

    if (!searchParam) {
      res.status(400).send({
        message: "Search query is required",
      });
    }

    const filteredBlogs = memoizedQuerySearch(searchParam, blogsData);

    res.send({
      filteredBlogs,
    });
  } catch (error) {
    if (error.message === "Failed to fetch blog data") {
      res.status(500).send({
        message: "Failed to fetch blog data",
      });
    } else {
      res.status(500).send({
        message: "Failed to search blogs",
      });
    }
  }
});

module.exports = { apiRouter };
