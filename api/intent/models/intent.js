'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
const tf = require('@tensorflow/tfjs-node');
const stemmer = require('../services/intent');

let intentsData = [];
let training = [];
let trainX = [];
let trainY = [];
let documents = [];
let classes = [];
let words = [];
let dataModel;
let modelFitComplete = false;
let conversations = [];

const getIntents = async () => {
  const data = await strapi.query('intent').find();
  let items = [];
  for (let intent of data) {
    items.push({
      tag: intent.Tag,
      context_filter: intent.ContextFilter,
      context_set: intent.ContextSet,
      patterns: intent.Patterns.map(pattern => pattern.Text),
      responses: intent.Responses.map(response => response.Text)
    })
  }
  return items;
}

const initializeTrainingData = () => {
  // Classify words
  classifyWords();

  // Create training data
  createTrainingData();

  // Shuffle array of objects
  training = getShuffledArr(training);

  console.log('training', training);
  // Split input and target
  training.forEach(tData => {
    trainX.push(tData.input);
    trainY.push(tData.target);
  });

  createModel();
}


const classifyWords = () => {
  for (const intent of intentsData) {
    for (const pattern of intent.patterns) {
      const w = wordTokenize(pattern);
      words.push(...w);

      const d = [w, intent.tag];
      documents.push(d);

      const inClassesAlready = classes.some(c => {
        return c === intent.tag;
      });
      if (!inClassesAlready) {
        classes.push(intent.tag);
      }
    }
  }
  stemWords();

  // Remove duplicate
  words = words.filter((v, i, a) => a.indexOf(v) === i);
  console.log('words', words);
  console.log('classes', classes);
  console.log('documents', documents);
}

const wordTokenize = (pattern) => {
  return pattern.split(' ');
}

const stemWords = () => {
  words = words.map(word => {
    // Remove non alpha numeric characters
    word = word.replace(/[\W+]+/g, '');
    // To lower case
    word = word.toLowerCase();
    return stemmer(word);
  });
}

const createTrainingData = () => {
  for (const doc of documents) {
    // initialize our bag of words
    const bag = [];
    // list of tokenized words for the pattern
    let patternWords = doc[0];
    patternWords = patternWords.map(pWord => {
      // Remove non alpha numeric characters
      pWord = pWord.replace(/[\W+]+/g, '');
      // To lower case
      pWord = pWord.toLowerCase();
      return stemmer(pWord);
    });
    console.log('pattern words', patternWords);

    for (const w of words) {
      const wInPatternWords = patternWords.some(pW => {
        return pW === w;
      });
      if (wInPatternWords) {
        bag.push(1);
      } else {
        bag.push(0);
      }
    }

    const outputRow = [];
    for (const r of classes) {
      outputRow.push(0);
    }
    outputRow[classes.indexOf(doc[1])] = 1;
    console.log('outpur row', bag, outputRow);

    training.push({
      input: bag,
      target: outputRow
    });
  }
}

const getShuffledArr = (arr) => {
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
}

const createModel = () => {
  dataModel = tf.sequential();
  // console.log('model', model);
  dataModel.add(tf.layers.dense({
    units: 128,
    inputShape: [trainX[0].length],
    activation: 'relu'
  }));

  dataModel.add(tf.layers.dropout({
    rate: 0.5
  }));

  dataModel.add(tf.layers.dense({
    units: 64,
    activation: 'relu'
  }));

  dataModel.add(tf.layers.dropout({
    rate: 0.5
  }));

  dataModel.add(tf.layers.dense({
    units: trainY[0].length, activation: 'softmax'
  }));

  dataModel.compile({
    loss: 'categoricalCrossentropy',
    optimizer: 'adam', // works than sgd
    metrics: ['accuracy']
  });

  // let xs = tf.tensor2d([
  //   [0, 0], [0, 1], [1, 0], [1, 1]
  // ],
  // [4, 2]);
  // console.log('xs', xs);
  const xs = tf.tensor2d(trainX, [trainX.length, trainX[0].length]);


  // const ys = tf.tensor2d(
  //   [0, 1, 1, 0], [4, 1]
  // );
  // console.log('ys', ys);
  const ys = tf.tensor2d(trainY, [trainY.length, trainY[0].length]);
  console.log('trainX', trainX.length, trainX[0].length, trainX);
  console.log('trainY', trainY.length, trainY[0].length, trainY);
  // Fit the model
  // this.model.fit(np.array(train_x), np.array(train_y), epochs=200, batch_size=5, verbose=1)

  dataModel.fit(xs, ys, { epochs: 200, batch_size: 7, verbose: 1 }).then(() => {
    console.log('modeling fit complete');
    // Save the model in session storage
    modelFitComplete = true;
    predict();
    // sessionStorage.setItem(tfModel, JSON.stringify(this.model));
    // (dataModel.predict(tf.tensor2d(this.trainX[0], [1, this.trainX[0].length])) as any).print();
  });

  // Test prediction
}

const predict = () => {

  const question = 'laterthisweek';
  // Transform question to input
  const xs = transformQuestionToTensor(question);
  console.log('xs', xs);

  // Make prediction
  const prediction = dataModel.predict(tf.tensor2d(xs, [1, xs.length]));
  const result = prediction.dataSync();
  console.log('result', result);

  // Find the question class
  const maxValue = Math.max(...result);
  const maxValueIndex = result.indexOf(maxValue);


  const predictedClass = classes[maxValueIndex];
  console.log('predictedClass', predictedClass);

  // Get responses
  let response = '';
  for (const intent of intentsData) {
    if (intent.tag === predictedClass) {
      // Loop on responses
      // Make a random choice of response
      const responseLen = intent.responses.length;
      response = intent.responses[Math.floor(Math.random() * Math.floor(responseLen))];
    }
  }

  conversations.push({
    question: question,
    answer: response
  });

  console.log('conversations', conversations);
  // this.question = '';
}

const transformQuestionToTensor = (question) => {
  // list of tokenized words for the pattern
  let patternWords = wordTokenize(question);
  // initialize our bag of words
  const bag = [];

  patternWords = patternWords.map(pWord => {
    // Remove non alpha numeric characters
    pWord = pWord.replace(/[\W+]+/g, '');
    // To lower case
    pWord = pWord.toLowerCase();
    return stemmer(pWord);
  });

  for (const w of words) {
    const wInPatternWords = patternWords.some(pW => {
      return pW === w;
    });
    if (wInPatternWords) {
      bag.push(1);
    } else {
      bag.push(0);
    }
  }

  return bag;
}

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      intentsData = await getIntents()
      console.log('intentsData', intentsData);
      console.log('stemmer', stemmer);
      initializeTrainingData();
    },
  },
};
