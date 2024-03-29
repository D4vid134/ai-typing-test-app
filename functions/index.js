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
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({
  maxInstances: 10,
});

const openai = new OpenAI({apiKey: process.env.OPENAI_APIKEY});
const admin = require("firebase-admin");
admin.initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.generateAiText = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.time("Total Execution Time");
    const body = req.body;
    const prompt = body.prompt;
    const wordCount = body.wordCount;

    let message = `You are a text generator for typing tests. The prompt is "${prompt}". 
      The word count is ${wordCount}. Generate text that is similar to the prompt and is the given word count.`;

    if (body.focus.length > 0) {
      message += ` There are also some focus characters that you should try to include more. They are ${body.focus}.`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{"role": "system", "content": message}],
      model: "gpt-3.5-turbo-1106",
    });

    console.timeEnd("Total Execution Time");

    return res.status(200).send({
      text: completion.choices[0].message.content,
    });
  });
});

const fetchPassages = async (category, amount) => {
  if (category === "All") {
    let listOfCategories = ["fun facts", "science", "history", "mythology", "history", "sports", "science"];

    let passages = [];

    const categorySubjections = {};

    // randomly select a category
    for (let i = 0; i < amount; i++) {
      category = listOfCategories[Math.floor(Math.random() * listOfCategories.length)];
      let subsections = {};
      // if the category has already been selected, then get the subsections from the map
      if (categorySubjections[category]) {
        subsections = categorySubjections[category];
      } else {
        const categoryDoc = await admin.firestore().collection("passages").doc(category).get();
        subsections = categoryDoc.data().subsections;
        categorySubjections[category] = {...subsections}; // Copy the subsections
      }
    
      // randomly select a subsection from the subsections map
      const subsectionKeys = Object.keys(subsections);
      if (subsectionKeys.length === 0) continue; // Skip if no more subsections are available
    
      const randomIndex = Math.floor(Math.random() * subsectionKeys.length);
      const subsection = subsectionKeys[randomIndex];
    
      const passage = subsections[subsection];
      passages.push(passage);
    
      // Remove the selected subsection
      delete categorySubjections[category][subsection];
    }
    return passages;
  } else {
    const categoryDoc = await admin.firestore().collection("passages").doc(category).get();
    const subsections = categoryDoc.data().subsections;
    let passages = [];
    let subsectionKeys = Object.keys(subsections);

    for (let i = 0; i < amount; i++) {
      if (subsectionKeys.length === 0) break; // Break if no more subsections are available

      const randomIndex = Math.floor(Math.random() * subsectionKeys.length);
      const subsection = subsectionKeys[randomIndex];

      const passage = subsections[subsection];
      passages.push(passage);

      // Remove the selected subsection from the list
      subsectionKeys.splice(randomIndex, 1);
    }
    return passages;
  }
};

exports.fetchPassages = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const body = req.body;
    const category = body.category;
    const amount = body.amount;

    const passages = await fetchPassages(category, amount);

    for (let i = 0; i < passages.length; i++) {
      if (passages[i].includes("–")) {
        passages[i] = passages[i].replaceAll("–", "-");
      }
    }

    for (let i = 0; i < passages.length; i++) {
      if (passages[i].includes("—")) {
        passages[i] = passages[i].replaceAll("—", "-");
      }
    }

    // for each passage add a space at the end
    for (let i = 0; i < passages.length; i++) {
      passages[i] += " ";
    }

    return res.status(200).send({
      passages: passages,
    });
  });
});

const generateNewPassage = async (subsection) => {
  // pick a number between 70 and 130
  const wordCount = Math.floor(Math.random() * (130 - 70 + 1) + 70);

  // pick a random adjective
  const adjectives = ["lesser known", "interesting", "famous", "funny", "informative", "weird", "less known", "obscure", "modern", "old"];

  // some patterns that the ai uses often so we want to avoid them
  const usesQuestion = Math.random() < 0.25;
  const useQuestionString = usesQuestion ? "Use a question in the passage." : "Do not ask a question in the passage.";

  const useQuote = Math.random() < 0.02;
  const useQuoteString = useQuote ? "Use a quote in the passage." : "";

  const useGeneric = Math.random() < 0.75;
  const useGenericString = useGeneric ? "Dont use 'Did you know' or 'In the realm of' type phrases." : "";

  const useSubsection = Math.random() < 0.10;
  const useSubsectionString = useSubsection ? `Even though the topic is about it. Dont use the word ${subsection}.` : ``;

  const useDuring = Math.random() < 0.40;
  const useDuringString = useDuring ? "Dont start the passage with 'During'." : "";

  const useIn = Math.random() < 0.40;
  const useInString = useIn ? "Dont start the passage with 'In'." : "";

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": `You are generating text for a typing test. You speak plainly. 
    The category is ${adjective} ${subsection}. ${useQuestionString} ${useQuoteString} ${useGenericString} Generate a ${wordCount} word interesting thing to type about. Make sure its INTERESTING. Like a fun fact, cool person/event, or funny.
    ${useSubsectionString} ${useDuringString} ${useInString} Dont use headers or line spacing. 
    Just the text in one big paragraph.`}],
    model: "gpt-3.5-turbo-1106",
  });
  console.log(adjective);
  console.log(subsection);
  console.log(completion.choices[0].message.content);

  return completion.choices[0].message.content;
}

exports.updateNewPassage = onSchedule("every day 00:00", async (context) => {
  // for each category, select a random subsection and get the passage. replace the old passage with the new one
  const categories = ["fun facts", "history", "mythology", "sports", "science"];

  for (let i = 0; i < categories.length; i++) {
    const categoryDoc = await admin.firestore().collection("passages").doc(categories[i]).get();
    const subsections = categoryDoc.data().subsections;
    const subsectionKeys = Object.keys(subsections);

    const randomIndex = Math.floor(Math.random() * subsectionKeys.length);
    const subsection = subsectionKeys[randomIndex];

    if (subsection.includes("custom")) {
      i--;
      continue;
    }

    const passage = await generateNewPassage(subsection);

    await admin.firestore().collection("passages").doc(categories[i]).update({
      [`subsections.${subsection}`]: passage,
    });
  }
});

  // firebase function to send password reset email
  exports.sendPasswordResetEmail = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      let body = req.body;
      
      if (!body || !body.email) {
        return res.status(400).send({
          error: "Fields email is required.",
        });
      }
  
      try {
        const email = body.email;
        const user = await admin.auth().getUserByEmail(email);
        console.log(user);
        if (!user) {
          return res.status(400).send({
            error: "No user found with that email.",
          });
        }

        const actionCodeSettings = {
          url: "https://ai-typing-test.web.app/",
          handleCodeInApp: true,
        };
        const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
        console.log(link);
        return res.status(200).send({
          message: "Email successfully sent.",
        });
      } catch (err) {
        console.log(err);
        return res.status(500).send({
          error: `Error: Send mail to ${body.email} failed: ${err.message}`,
        });
      }
    });
  });




// const generateTextBasedOnCategory = async (category) => {
//   const completion = await openai.chat.completions.create({
//     messages: [{"role": "system", "content": `You are generating text for a typing test. The category is
//      ${category}. Generate a 150 word interesting thing to type about. Just the text in one big paragraph.`}],
//     model: "gpt-3.5-turbo-1106",
//   });

//   return completion.choices[0].message.content;
// };
