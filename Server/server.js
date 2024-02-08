const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

let totalUsage = 0;
let totalMoneySpent = 0;

const readline = require('readline');
app.post('/combine-elements/:dataKey', async (req, res) => {
    const { element1, element2 } = req.body;
    const { dataKey } = req.params;
    const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);
    
    if (!fs.existsSync(userSaveFile)) {
        res.status(404).json({ error: 'User file doesn\'t exist!' });
        return;
    }

    const rawData = fs.readFileSync(userSaveFile, 'utf-8');
    let userSaveData = JSON.parse(rawData);
    if (!userSaveData.elements.includes(element1) || !userSaveData.elements.includes(element2)) {
        console.log(`User: ${dataKey} doesn't have ${element1} or ${element2} save file for reference: \n ${userSaveData}`);
        res.status(404).json({ error: 'Error processing combination, user doesn\'t have such elements!' });
        return;
    }

    const fileStream = fs.createReadStream('Recipes/recipes.txt');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundCombination = false;
    let newElement = '';

    for await (const line of rl) {
        const [combo, result] = line.split(' = ');
        const [recipeElement1, recipeElement2] = combo.split(' + ');

        if ((recipeElement1 === element1 && recipeElement2 === element2) ||
                (recipeElement1 === element2 && recipeElement2 === element1)) {
            foundCombination = true;
            newElement = result;
            break;
        }
    }

    if (foundCombination) {
        newElement = newElement.trim();
        newElement = newElement.split('=').pop().trim();
        newElement = newElement.replaceAll(".","");
        
        userSaveData.elements.push(newElement);
        fs.writeFileSync(userSaveFile, JSON.stringify(userSaveData, null, 2));

        res.json({ newElement: newElement });
        return;
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: ` 
You're the console of a game about combining elements
You must ONLY respond with the element a given combination produces

You DONT give any explanations
You DONT mention the elemenets that the user submits
You MUST capitalize the first letter of each word of your element
You DONT put a period at the end of your response
You DONT give or produce errors
Elements that contain more than one word MUST have a space in between them

Some elements and their combinations:
Fire + Water = Steam
Water + Water = Sea
Earth + Earth = Land
Fire + Fire = Explosion
Human + Robot = Cyborg`,
                },
            {
                role: 'user',
                content: `${element1} + ${element2}
                    Remember to respond only with the element that combination produces.`,
            },
        ],
            max_tokens: 10,
            n: 1,
            stop: null,
            temperature: 0.7,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${samplekey}`,
            },
        }
    );

    // Post-processing of the response
    newElement = response.data.choices[0].message.content.trim();
    
    if (newElement.includes('=')) {
      newElement = newElement.split('=').pop().trim();
    }
    newElement = newElement.replaceAll(".","");
    fs.appendFileSync('Recipes/recipes.txt', `${element1} + ${element2} = ${newElement}\n`);
    
    userSaveData.elements.push(newElement);
    fs.writeFileSync(userSaveFile, JSON.stringify(userSaveData, null, 2));

    res.json({ newElement });

    const tokenUsage = response.data.usage.total_tokens;
    totalUsage = tokenUsage + totalUsage;
    totalMoneySpent = totalUsage * 0.000002;

    const red = "\x1b[31m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const blue = "\x1b[34m";
    const reset = "\x1b[0m";

    console.log("Token usage this call:", `${yellow}${tokenUsage}${reset}`, "Total usage:", `${blue}${totalUsage}${reset}`, "Money spent:", `${green}${parseFloat(totalMoneySpent.toFixed(3))}$${reset}`);

    } catch (error) {
        console.error('Error fetching combined element:', error);
        res.status(500).json({ error: 'Failed to fetch combined element' });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
// CHALLENGES
const storageDir = path.join(__dirname, 'Storage');
app.get('/daily-challenge', (req, res) => {
  const dailyChallengeFile = path.join(storageDir, 'dailyChallenge.json');

  if (fs.existsSync(dailyChallengeFile)) {
    const rawFileData = fs.readFileSync(dailyChallengeFile, 'utf-8');
    const JSONdata = JSON.parse(rawFileData);
    const challenges = JSONdata.challenges;
    const lastChallenge = challenges[challenges.length - 1];
    const activeChallenge = Object.keys(lastChallenge)[0];
    const reward = lastChallenge[activeChallenge];

    res.status(200).json({ challenge: activeChallenge, reward: reward });
  } else {
    console.error("dailyChallenge.txt doesn't exist inside Storage dir");
    res.status(404).json({ message: 'File does not exist.' });
  }
});

app.get('/concurrent-challenge/:dataKey', (req, res) => {
    const { dataKey } = req.params;
    const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);
    let userSaveData = undefined;
    if (fs.existsSync(userSaveFile)) {
        const rawData = fs.readFileSync(userSaveFile,'utf-8');
        userSaveData = JSON.parse(rawData);
    }

    let challenge = userSaveData.concurrentElement;
    if (typeof challenge === 'undefined') {
        const concurrentChallengeFile = path.join(storageDir, 'concurrentChallenges.json');
        if (fs.existsSync(concurrentChallengeFile,'utf-8')) {
            const rawFileData = JSON.parse(fs.readFileSync(concurrentChallengeFile,'utf-8'));
            let chosenElement = ""
            for (let i = 0; i < 3; i++) {
                chosenElement = rawFileData.concurrentChallenges[getRandomNumber(0,rawFileData.concurrentChallenges.length)];
                if (typeof userSaveData.pastConcurrentElements === 'undefined') {
                    userSaveData.pastConcurrentElements = [];
                }
                if (!userSaveData.elements.includes(chosenElement) && !userSaveData.pastConcurrentElements.includes(chosenElement)) {
                    break;
                }
            }
            userSaveData.concurrentElement = chosenElement;
            fs.writeFileSync(userSaveFile,JSON.stringify(userSaveData,null,2));
            challenge = userSaveData.concurrentElement;
        }
    }
    res.status(200).json({ challenge: challenge });
});

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getUserData(dataKey) {
    const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);
    let userSaveData = {};
    if (fs.existsSync(userSaveFile)) {
        const rawData = fs.readFileSync(userSaveFile,'utf-8');
        userSaveData = JSON.parse(rawData);
    }
    return userSaveData;
}

function writeUserData(dataKey,data) {
    const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);
    fs.writeFileSync(userSaveFile,JSON.stringify(data,null,2));
}
// SAVING - LOADING - RESETTING - IMAGING

const savesDir = path.join(__dirname, 'Saves');

app.get('/load-elements/:dataKey', (req, res) => {
  const { dataKey } = req.params;
  const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);
  let userSaveData = { elements: ["Fire","Water","Earth","Air"]};

  if (fs.existsSync(userSaveFile)) {
    const rawData = fs.readFileSync(userSaveFile, 'utf-8');
    userSaveData = JSON.parse(rawData);

    if (userSaveData.elements) {
      return res.status(200).json({ elements: userSaveData.elements });
    }
  } else {
    fs.writeFileSync(userSaveFile, JSON.stringify(userSaveData,null,2));
    return res.status(200).json({ elements: userSaveData.elements });
  }

  res.status(404).json({ message: 'No elements found for the provided dataKey.' });
});

app.post('/reset-progress', (req, res) => {
  const { dataKey } = req.body;
  const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);

  if (fs.existsSync(userSaveFile)) {
    const rawData = fs.readFileSync(userSaveFile, 'utf-8');
    let userSaveData = JSON.parse(rawData);

    // Reset elements and folders
    if (userSaveData.elements) {
      userSaveData.elements = ["Fire","Water","Earth","Air"];
      userSaveData.folders = {};

      fs.writeFileSync(userSaveFile, JSON.stringify(userSaveData, null, 2));
      return res.status(200).json({ message: 'Progress reset successfully.' });
    } else {
      return res.status(404).json({ message: 'DataKey not found.' });
    }
  } else {
    return res.status(404).json({ message: 'Save file not found.' });
  }
});

app.get('/get-element-image/:elementName', async (req, res) => {
  const { elementName } = req.params;
  const safeElementName = sanitizeFilename(elementName);
  const imageDir = path.join(__dirname, '..', 'Client', 'images', 'element_images');
  const imagePath = path.join(imageDir, `${safeElementName}.txt`);

  if (fs.existsSync(imagePath)) {
    // If image url already exists, send it
    const imageUrl = fs.readFileSync(imagePath, 'utf-8');
    res.redirect(imageUrl);
  } else {
    // If image url does not exist, fetch it from unsplash
    const unsplashUrl = `https://source.unsplash.com/featured/?${elementName}`;

    try {
      const response = await axios.get(unsplashUrl, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 303;
        }
      });

      const imageUrl = response.headers.location;

      // Save the image url for future use
      fs.writeFileSync(imagePath, imageUrl, 'utf-8');

      // Send the image url
      res.redirect(imageUrl);
    } catch (error) {
      console.error('Error fetching image url:', error);
      res.status(500).json({ error: 'Failed to fetch image url' });
    }
  }
});


app.post('/save-folders', (req, res) => {
  const { dataKey, folders } = req.body;
  const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);

  let userSaveData = { folders: {} };

  if (fs.existsSync(userSaveFile)) {
    const rawData = fs.readFileSync(userSaveFile, 'utf-8');
    userSaveData = JSON.parse(rawData);
  }

  userSaveData.folders = folders;
  fs.writeFileSync(userSaveFile, JSON.stringify(userSaveData, null, 2));

  res.status(200).json({ message: 'Folders saved successfully.' });
});


app.get('/load-folders/:dataKey', (req, res) => {
  const { dataKey } = req.params;
  const userSaveFile = path.join(savesDir, `${sanitizeFilename(dataKey)}.txt`);

  if (fs.existsSync(userSaveFile)) {
    const rawData = fs.readFileSync(userSaveFile, 'utf-8');
    const userSaveData = JSON.parse(rawData);

    if (userSaveData.folders) {
      return res.status(200).json({ folders: userSaveData.folders });
    }
  }

  res.status(404).json({ message: 'No folders found for the provided dataKey.' });
});

function sanitizeFilename(input) {
    return input.replace(/[\/\\?%*:|"<>]/g, '-');
}
