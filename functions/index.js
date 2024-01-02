/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const dotenv = require("dotenv");
dotenv.config();
const OpenAI = require("openai");

const openai = new OpenAI({apiKey: process.env.OPENAI_APIKEY});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.generateAiText = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.time("Total Execution Time");
    const body = JSON.parse(req.body);
    const prompt = body.prompt;
    const wordCount = body.wordCount;

    let content = "prompt: " + prompt + ", wordcount: " + wordCount;
    if (body.focus) {
      content += ", focus: " + body.focus;
    }

    const completion = await openai.chat.completions.create({
      messages: [{"role": "system", "content": `You are a text generator for typing 
      tests. You will be given a prompt and word count. You must generate text that is similar to the 
      prompt and is the given word count. You may also be provided with a few characters to focus on. 
      The specific format of the input is
      "prompt: {prompt}, wordcount: {wordcount}, focus: {characters separated by spaces}.`},
      {"role": "user", "content": content}],
      model: "gpt-3.5-turbo-1106",
    });

    console.timeEnd("Total Execution Time");

    return res.status(200).send({
      text: completion.choices[0].message.content,
    });
  });
});


