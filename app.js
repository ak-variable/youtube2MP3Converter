// Required packages
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

// Create express server
const app = express();

// Server PORT number
const PORT = process.env.PORT || 3000;

// Set template engine
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//function to extract VideoId
function extractVideoId(url) {
    // Regular expression to match YouTube URL patterns
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=))([^&\n?#]+)/;
    
    // Attempt to extract the video ID from the URL
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
        return match[1];
    } else {
        return null; // If no match found
    }
}

app.post("/convert-mp3", async (req, res) => {
    const UserInput = req.body.VideoID;

    const videoId = extractVideoId(UserInput);

    console.log("Received videoId:", videoId); // Add this line

    if (!videoId) {
        return res.render("index", { success: false, message: "Please enter a video ID" });
    } else {
        const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": process.env.API_KEY,
                "X-RapidAPI-Host": process.env.API_HOST,
            },
        });

        try {
            const fetchResponse = await fetchAPI.json();
            if (fetchResponse.status === "ok") {
                return res.render("index", {
                    success: true,
                    song_title: fetchResponse.title,
                    song_link: fetchResponse.link,
                });
            } else {
                return res.render("index", {
                    success: false,
                    message: fetchResponse.msg,
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return res.render("index", {
                success: false,
                message: "An error occurred while fetching data from the API",
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
