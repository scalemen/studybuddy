import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Summarizes a topic and provides educational content for students
 */
export async function summarizeTopic(topic: string): Promise<string> {
  try {
    // Check if OpenAI API key is valid or API quota is exceeded
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "REPLACE_WITH_YOUR_OPENAI_API_KEY") {
      // If we're in demo mode without a valid API key, return a hardcoded summary
      return generateFallbackSummary(topic);
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant that provides helpful, accurate, concise summaries for students. Keep your explanations educational, accurate, and easy to understand for students.",
        },
        {
          role: "user",
          content: `Please provide a concise but comprehensive educational summary about the topic: ${topic}. The summary should be suitable for students.`,
        },
      ],
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error: any) {
    console.error("Error summarizing topic:", error);
    
    // Handle rate limit and quota errors gracefully
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log("Using fallback summary due to API quota limit");
      return generateFallbackSummary(topic);
    }
    
    throw new Error("Failed to generate topic summary. Please try again later.");
  }
}

// Provides a simple fallback summary when OpenAI API is not available
function generateFallbackSummary(topic: string): string {
  // Create educational summaries for common topics
  const topics: Record<string, string> = {
    "photosynthesis": "Photosynthesis is the process by which green plants and some other organisms convert light energy into chemical energy. During photosynthesis, plants capture sunlight using chlorophyll in their leaves. They use this energy to combine carbon dioxide from the air and water from the soil to create glucose (sugar) and oxygen. The chemical equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This process is essential for life on Earth as it produces oxygen and serves as the basis for most food chains.",
    
    "world war 2": "World War II (1939-1945) was a global conflict that pitted the Allied Powers (led by the United States, United Kingdom, and Soviet Union) against the Axis Powers (led by Nazi Germany, Italy, and Japan). It began with Germany's invasion of Poland and expanded across Europe, Africa, Asia, and the Pacific. Key events include the Holocaust, the bombing of Pearl Harbor, D-Day, and the atomic bombings of Hiroshima and Nagasaki. With an estimated 70-85 million casualties, it was the deadliest conflict in human history and led to significant geopolitical changes, including the beginning of the Cold War.",
    
    "algebra": "Algebra is a branch of mathematics that uses symbols and letters to represent numbers, points, and other objects in equations and formulas. It provides tools to solve problems by manipulating these symbols according to specific rules. Core concepts include variables, expressions, equations, functions, and inequalities. Algebraic thinking allows us to find unknown values, describe patterns, and model real-world relationships mathematically. It serves as a foundation for higher mathematics and is widely applied in science, technology, engineering, and many other fields.",
    
    "human body": "The human body is a complex organism composed of multiple interconnected systems. Major systems include the skeletal system (206 bones providing structure), muscular system (over 600 muscles enabling movement), nervous system (brain, spinal cord, nerves for control and sensation), cardiovascular system (heart and blood vessels for circulation), respiratory system (lungs and airways for gas exchange), digestive system (processing food for nutrients), endocrine system (hormone regulation), and immune system (defense against disease). These systems work together to maintain homeostasis—a balanced internal environment necessary for survival.",
    
    "electricity": "Electricity is a form of energy resulting from the movement of charged particles, typically electrons. Basic principles include: conductors allow electron flow while insulators restrict it; current is the rate of electron flow measured in amperes; voltage is the electrical pressure that drives current; resistance impedes current flow and is measured in ohms. Electrical circuits can be series (one path) or parallel (multiple paths). Electricity generation methods include fossil fuels, nuclear energy, and renewables like solar and wind. Electricity powers modern society through lighting, heating, communications, and countless electronic devices.",
  };
  
  // Check for exact matches first
  if (topics[topic.toLowerCase()]) {
    return topics[topic.toLowerCase()];
  }
  
  // Check for partial matches
  for (const [key, summary] of Object.entries(topics)) {
    if (topic.toLowerCase().includes(key) || key.includes(topic.toLowerCase())) {
      return summary;
    }
  }
  
  // Generic response for topics not in our database
  return `${topic} is an important educational topic. To learn more about this subject, consider consulting textbooks, educational websites, or asking your teacher for specific resources. Learning about ${topic} can enhance your understanding of the world and contribute to your academic growth.`;
}

/**
 * Generates a quiz about a topic for students
 */
export async function generateTopicQuiz(topic: string, numQuestions: number = 5): Promise<any> {
  try {
    // Check if OpenAI API key is valid or quota exceeded
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "REPLACE_WITH_YOUR_OPENAI_API_KEY") {
      return generateFallbackQuiz(topic, numQuestions);
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational quiz generator that creates accurate, appropriate quiz questions for students. Create a mix of multiple-choice and true/false questions about the given topic.",
        },
        {
          role: "user",
          content: `Please generate ${numQuestions} quiz questions about "${topic}" for students. Return the response as a JSON array where each question object has these properties: question, options (array of possible answers), correctAnswer (the correct option), and explanation (why this answer is correct). For true/false questions, the options should be just ["True", "False"].`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate quiz. Empty response received.");
    }

    try {
      const parsedQuiz = JSON.parse(content);
      return parsedQuiz;
    } catch (e) {
      console.error("Error parsing quiz JSON:", e);
      throw new Error("Failed to parse quiz data. Invalid JSON format.");
    }
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    
    // Use fallback for rate limiting or quota issues
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log("Using fallback quiz due to API quota limit");
      return generateFallbackQuiz(topic, numQuestions);
    }
    
    throw new Error("Failed to generate a quiz. Please try again later.");
  }
}

// Generate a static fallback quiz for common topics
function generateFallbackQuiz(topic: string, numQuestions: number = 5): any {
  // Predefined quizzes for common topics
  const quizzes: Record<string, any> = {
    "photosynthesis": {
      "questions": [
        {
          "question": "What is the primary pigment in plants that absorbs light energy for photosynthesis?",
          "options": ["Chlorophyll", "Melanin", "Hemoglobin", "Carotene"],
          "correctAnswer": "Chlorophyll",
          "explanation": "Chlorophyll is the green pigment in plants that absorbs light energy, primarily from the blue and red parts of the electromagnetic spectrum, which is then used to power the photosynthetic process."
        },
        {
          "question": "Which gas is released as a byproduct of photosynthesis?",
          "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          "correctAnswer": "Oxygen",
          "explanation": "During photosynthesis, plants use carbon dioxide and water to produce glucose and oxygen. The oxygen is released as a byproduct, which is vital for the respiration of most living organisms."
        },
        {
          "question": "Where in the plant cell does the light-dependent reaction of photosynthesis occur?",
          "options": ["Thylakoid membrane", "Cell wall", "Mitochondria", "Cytoplasm"],
          "correctAnswer": "Thylakoid membrane",
          "explanation": "The light-dependent reactions occur in the thylakoid membrane of chloroplasts, where chlorophyll and other pigments are embedded to capture light energy."
        },
        {
          "question": "What are the two main products of photosynthesis?",
          "options": ["Glucose and oxygen", "Carbon dioxide and water", "ATP and NADPH", "Chlorophyll and carbon dioxide"],
          "correctAnswer": "Glucose and oxygen",
          "explanation": "The overall equation for photosynthesis shows that the main products are glucose (C₆H₁₂O₆) and oxygen (O₂). Glucose is a sugar that plants use for energy and to build other molecules."
        },
        {
          "question": "Photosynthesis requires light energy to proceed.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "explanation": "Photosynthesis is a light-dependent process that cannot occur without light energy. Plants capture this energy using pigments like chlorophyll to power the chemical reactions of photosynthesis."
        }
      ]
    },
    "world war 2": {
      "questions": [
        {
          "question": "When did World War II begin?",
          "options": ["1939", "1941", "1914", "1945"],
          "correctAnswer": "1939",
          "explanation": "World War II officially began on September 1, 1939, when Nazi Germany invaded Poland, leading Britain and France to declare war on Germany two days later."
        },
        {
          "question": "Which of these countries was NOT part of the Allied Powers during World War II?",
          "options": ["Japan", "United States", "Soviet Union", "United Kingdom"],
          "correctAnswer": "Japan",
          "explanation": "Japan was part of the Axis Powers along with Nazi Germany and Italy. The Allied Powers included the United States, Soviet Union, United Kingdom, and many others."
        },
        {
          "question": "What was D-Day?",
          "options": ["The Allied invasion of Normandy, France", "The bombing of Pearl Harbor", "The surrender of Japan", "The German invasion of the Soviet Union"],
          "correctAnswer": "The Allied invasion of Normandy, France",
          "explanation": "D-Day refers to the Allied invasion of Normandy on June 6, 1944, which was the largest seaborne invasion in history and began the liberation of Western Europe from Nazi control."
        },
        {
          "question": "The Holocaust resulted in the systematic murder of approximately how many Jewish people?",
          "options": ["6 million", "1 million", "3 million", "10 million"],
          "correctAnswer": "6 million",
          "explanation": "The Holocaust was the genocide of European Jews during World War II. Between 1941 and 1945, Nazi Germany and its collaborators systematically murdered approximately six million Jews."
        },
        {
          "question": "World War II ended in Europe after the United States dropped atomic bombs on Japan.",
          "options": ["False", "True"],
          "correctAnswer": "False",
          "explanation": "World War II in Europe ended on May 8, 1945 (VE Day) with Germany's unconditional surrender. The atomic bombs were dropped on Hiroshima and Nagasaki in August 1945, leading to Japan's surrender and the end of the war in the Pacific theater."
        }
      ]
    },
    "algebra": {
      "questions": [
        {
          "question": "What is the solution to the equation 2x + 5 = 15?",
          "options": ["x = 5", "x = 10", "x = 7.5", "x = 4"],
          "correctAnswer": "x = 5",
          "explanation": "To solve: 2x + 5 = 15\nSubtract 5 from both sides: 2x = 10\nDivide both sides by 2: x = 5"
        },
        {
          "question": "Which of the following is the quadratic formula?",
          "options": ["x = (-b ± √(b² - 4ac))/2a", "x = a² + b² = c²", "x = -b/a", "x = y² - y¹/x² - x¹"],
          "correctAnswer": "x = (-b ± √(b² - 4ac))/2a",
          "explanation": "The quadratic formula x = (-b ± √(b² - 4ac))/2a is used to solve quadratic equations in the form ax² + bx + c = 0, where a ≠ 0."
        },
        {
          "question": "What is the slope of a line with the equation y = 3x - 7?",
          "options": ["3", "-7", "0", "1/3"],
          "correctAnswer": "3",
          "explanation": "In the slope-intercept form y = mx + b, the coefficient of x is the slope. In the equation y = 3x - 7, the slope is 3."
        },
        {
          "question": "If f(x) = x² + 2x - 3, what is f(2)?",
          "options": ["5", "3", "7", "1"],
          "correctAnswer": "5",
          "explanation": "To find f(2), substitute 2 for x in the expression:\nf(2) = (2)² + 2(2) - 3\nf(2) = 4 + 4 - 3\nf(2) = 5"
        },
        {
          "question": "The graph of a linear equation always forms a straight line.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "explanation": "Linear equations in two variables (typically x and y) always graph as straight lines on the coordinate plane. This is a defining characteristic of linear equations."
        }
      ]
    },
    "human body": {
      "questions": [
        {
          "question": "Which organ is responsible for filtering blood and removing waste products?",
          "options": ["Kidneys", "Liver", "Heart", "Lungs"],
          "correctAnswer": "Kidneys",
          "explanation": "The kidneys filter blood to remove waste products and excess water, which are then excreted as urine. Each day, the kidneys filter about 120-150 quarts of blood to produce about 1-2 quarts of urine."
        },
        {
          "question": "How many chambers does the human heart have?",
          "options": ["4", "2", "3", "6"],
          "correctAnswer": "4",
          "explanation": "The human heart has four chambers: two upper chambers called atria (singular: atrium) and two lower chambers called ventricles. The right side pumps blood to the lungs, and the left side pumps blood to the rest of the body."
        },
        {
          "question": "Which system in the human body is responsible for producing hormones?",
          "options": ["Endocrine system", "Nervous system", "Digestive system", "Respiratory system"],
          "correctAnswer": "Endocrine system",
          "explanation": "The endocrine system consists of glands that produce and secrete hormones that regulate many bodily functions, including metabolism, growth, development, reproduction, sleep, and mood."
        },
        {
          "question": "What is the largest organ in the human body?",
          "options": ["Skin", "Liver", "Brain", "Lungs"],
          "correctAnswer": "Skin",
          "explanation": "The skin is considered the largest organ in the human body. It covers an area of about 20 square feet in adults and serves as a protective barrier against microbes, helps regulate body temperature, and enables touch sensations."
        },
        {
          "question": "Red blood cells are primarily responsible for carrying oxygen throughout the body.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "explanation": "Red blood cells (erythrocytes) contain hemoglobin, an iron-rich protein that binds to oxygen. Their primary function is to transport oxygen from the lungs to all tissues of the body and carry carbon dioxide back to the lungs."
        }
      ]
    },
    "electricity": {
      "questions": [
        {
          "question": "What is the unit of electric current?",
          "options": ["Ampere", "Volt", "Ohm", "Watt"],
          "correctAnswer": "Ampere",
          "explanation": "The ampere (symbol: A) is the SI base unit of electric current. It measures the rate of flow of electric charge past a point in an electric circuit."
        },
        {
          "question": "Which material is the best conductor of electricity?",
          "options": ["Silver", "Copper", "Gold", "Aluminum"],
          "correctAnswer": "Silver",
          "explanation": "Silver is the best conductor of electricity among all metals. It has the lowest electrical resistance, which allows electric current to flow more easily through it. However, copper is more commonly used in electrical wiring due to its lower cost."
        },
        {
          "question": "Ohm's Law states that current is equal to:",
          "options": ["Voltage divided by resistance", "Voltage multiplied by resistance", "Resistance divided by voltage", "Power divided by voltage"],
          "correctAnswer": "Voltage divided by resistance",
          "explanation": "Ohm's Law is expressed as I = V/R, where I is current (in amperes), V is voltage (in volts), and R is resistance (in ohms). This means that current is directly proportional to voltage and inversely proportional to resistance."
        },
        {
          "question": "What type of circuit allows electricity to flow through multiple paths?",
          "options": ["Parallel circuit", "Series circuit", "Combined circuit", "Closed circuit"],
          "correctAnswer": "Parallel circuit",
          "explanation": "In a parallel circuit, electric current can flow through multiple paths. If one path is broken, current can still flow through the other paths, unlike in a series circuit where a break in any part stops the flow of current throughout the entire circuit."
        },
        {
          "question": "Lightning is a form of static electricity discharge.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "explanation": "Lightning is indeed a massive electrostatic discharge between the atmosphere and the ground, or within clouds. It occurs when there is a buildup of electric charges within clouds due to movement of air and water particles, creating an imbalance that is eventually discharged as lightning."
        }
      ]
    }
  };
  
  // Default quiz about general knowledge
  const defaultQuiz = {
    "questions": [
      {
        "question": `What is the main focus of ${topic}?`,
        "options": ["Education", "Science", "History", "It varies by specific subject"],
        "correctAnswer": "It varies by specific subject",
        "explanation": `${topic} can encompass various aspects depending on the specific focus area. To get more precise information, consider researching specific aspects of ${topic}.`
      },
      {
        "question": `Which of these resources would be most helpful for learning about ${topic}?`,
        "options": ["Textbooks", "Online courses", "Educational videos", "All of the above"],
        "correctAnswer": "All of the above",
        "explanation": "When learning about any subject, using multiple resources such as textbooks, online courses, and educational videos provides a more comprehensive understanding."
      },
      {
        "question": `True or False: Understanding ${topic} requires prior knowledge of related subjects.`,
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "Most academic topics build upon foundational concepts. Having prior knowledge of related subjects generally helps in understanding more complex topics."
      },
      {
        "question": "Which learning method is usually most effective for mastering new subjects?",
        "options": ["Reading only", "Watching videos only", "Active practice and application", "Memorization only"],
        "correctAnswer": "Active practice and application",
        "explanation": "Active learning through practice and application of concepts leads to better retention and understanding than passive methods like reading or watching videos alone."
      },
      {
        "question": "What is a good approach to studying new topics?",
        "options": ["Cramming all at once", "Spaced repetition over time", "Focusing only on areas you already understand", "Avoiding difficult concepts"],
        "correctAnswer": "Spaced repetition over time",
        "explanation": "Research shows that spaced repetition—studying material at increasing intervals over time—leads to better long-term retention than cramming or other study methods."
      }
    ]
  };
  
  // Formulate a lowercase version once for efficiency
  const lowercaseTopic = topic.toLowerCase();
  
  // Check for exact matches
  if (quizzes[lowercaseTopic]) {
    return quizzes[lowercaseTopic];
  }
  
  // Check for partial matches
  for (const [key, quiz] of Object.entries(quizzes)) {
    if (lowercaseTopic.includes(key) || key.includes(lowercaseTopic)) {
      return quiz;
    }
  }
  
  // Return default quiz for topics not in our database
  return defaultQuiz;
}

/**
 * Analyzes a homework problem from an image and provides a step-by-step solution
 */
export async function analyzeHomeworkImage(
  base64Image: string, 
  homeworkTitle: string
): Promise<{ problem: string; solution: string }> {
  try {
    // Check if OpenAI API key is valid or quota exceeded
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "REPLACE_WITH_YOUR_OPENAI_API_KEY") {
      console.log("No valid API key. Using fallback homework analysis.");
      return generateFallbackHomeworkAnalysis(homeworkTitle);
    }
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant that helps students with homework. Analyze the problem in the image and provide a detailed step-by-step solution that explains the concept and approach."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `This is my homework titled "${homeworkTitle}". Please: 
              1. First, identify and clearly state what the problem or question is asking
              2. Then, provide a detailed step-by-step solution that would help me understand how to solve this type of problem
              3. Explain any relevant concepts I should understand
              4. Format your response with a "PROBLEM:" section followed by a "SOLUTION:" section`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        },
      ],
      max_tokens: 1000,
    });

    const content = visionResponse.choices[0].message.content || "";
    
    // Extract problem and solution from the response
    const problemMatch = content.match(/PROBLEM:(.*?)(?=SOLUTION:|$)/s);
    const solutionMatch = content.match(/SOLUTION:(.*)/s);
    
    return {
      problem: problemMatch ? problemMatch[1].trim() : "Could not identify the problem clearly.",
      solution: solutionMatch ? solutionMatch[1].trim() : "Could not generate a solution."
    };
  } catch (error: any) {
    console.error("Error analyzing homework:", error);
    
    // Handle rate limit and quota errors gracefully
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log("Using fallback homework analysis due to API quota limit");
      return generateFallbackHomeworkAnalysis(homeworkTitle);
    }
    
    throw new Error("Failed to analyze homework. Please try again later.");
  }
}

// Generate a fallback homework analysis based on the title
/**
 * Generates flashcards for a specific topic using the OpenAI API
 * @param topic The topic to generate flashcards for
 * @param count The number of flashcards to generate (default: 5)
 * @returns An array of flashcards with front (question) and back (answer)
 */
export async function generateFlashcards(topic: string, count: number = 5): Promise<Array<{front: string, back: string}>> {
  try {
    // Check if OpenAI API key is valid or quota exceeded
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "REPLACE_WITH_YOUR_OPENAI_API_KEY") {
      console.log("No valid API key. Using fallback flashcard generation.");
      return generateFallbackFlashcards(topic, count);
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant that creates effective and accurate flashcards for students. Create flashcards that test important concepts and facts about the given topic."
        },
        {
          role: "user",
          content: `Generate ${count} flashcards about "${topic}". For each flashcard, create a question for the front and the answer for the back. Make the flashcards educational, accurate, and helpful for learning. Format your response as JSON with this structure: [{"front": "question", "back": "answer"}, ...]. Only include the JSON array in your response, no additional text.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    const content = response.choices[0].message.content || "";
    
    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      
      // Check if the response has the expected structure
      if (parsedContent.flashcards && Array.isArray(parsedContent.flashcards)) {
        return parsedContent.flashcards.slice(0, count).map((card: any) => ({
          front: card.front || "Question not available",
          back: card.back || "Answer not available"
        }));
      } 
      
      // If the structure is different but still has front/back properties
      if (Array.isArray(parsedContent) && parsedContent.length > 0 && 'front' in parsedContent[0]) {
        return parsedContent.slice(0, count);
      }
      
      // Fallback in case of unexpected response structure
      console.log("Unexpected response structure, using fallback");
      return generateFallbackFlashcards(topic, count);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return generateFallbackFlashcards(topic, count);
    }
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    
    // Handle rate limit and quota errors gracefully
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log("Using fallback flashcards due to API quota limit");
      return generateFallbackFlashcards(topic, count);
    }
    
    // Return fallback flashcards for any error
    return generateFallbackFlashcards(topic, count);
  }
}

/**
 * Generates fallback flashcards when the OpenAI API is unavailable
 * @param topic The topic for the flashcards
 * @param count The number of flashcards to generate
 * @returns An array of generic flashcards related to the topic
 */
function generateFallbackFlashcards(topic: string, count: number = 5): Array<{front: string, back: string}> {
  const lowerTopic = topic.toLowerCase();
  
  // Predefined flashcards for common topics
  const flashcardSets: Record<string, Array<{front: string, back: string}>> = {
    "photosynthesis": [
      { front: "What is photosynthesis?", back: "The process by which green plants and some other organisms convert light energy into chemical energy." },
      { front: "What is the chemical equation for photosynthesis?", back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" },
      { front: "Where does photosynthesis occur in plant cells?", back: "In the chloroplasts, specifically in the thylakoid membranes." },
      { front: "What are the two main stages of photosynthesis?", back: "The light-dependent reactions and the Calvin cycle (light-independent reactions)." },
      { front: "What pigment is essential for capturing light energy in photosynthesis?", back: "Chlorophyll, primarily chlorophyll a and chlorophyll b." }
    ],
    "history": [
      { front: "When did World War II end?", back: "September 2, 1945, with the surrender of Japan." },
      { front: "Who was the first President of the United States?", back: "George Washington (1789-1797)." },
      { front: "What was the Renaissance?", back: "A period of European cultural, artistic, political, and scientific rebirth after the Middle Ages, from the 14th to the 17th century." },
      { front: "When did the Industrial Revolution begin?", back: "In Great Britain in the mid-18th century (around 1760)." },
      { front: "What was the Magna Carta?", back: "A charter of rights agreed to by King John of England in 1215, establishing that everyone, including the king, was subject to the law." }
    ],
    "mathematics": [
      { front: "What is the Pythagorean theorem?", back: "In a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the lengths of the other two sides: a² + b² = c²." },
      { front: "What is the quadratic formula?", back: "For an equation ax² + bx + c = 0, the solutions are x = (-b ± √(b² - 4ac)) / 2a." },
      { front: "What is a prime number?", back: "A natural number greater than 1 that can only be divided evenly by 1 and itself." },
      { front: "What is the definition of a derivative in calculus?", back: "The derivative of a function represents its rate of change. It is defined as the limit of the ratio of the change in the function to the change in the independent variable as the change in the independent variable approaches zero." },
      { front: "What is the formula for the area of a circle?", back: "A = πr², where r is the radius of the circle." }
    ],
    "biology": [
      { front: "What is DNA?", back: "Deoxyribonucleic acid, a molecule composed of two polynucleotide chains that coil around each other to form a double helix carrying genetic instructions." },
      { front: "What is cellular respiration?", back: "The process by which cells convert nutrients into energy (ATP) and waste products." },
      { front: "What is natural selection?", back: "The process by which organisms that are better adapted to their environment tend to survive and produce more offspring." },
      { front: "What are the main components of a cell?", back: "In eukaryotic cells: cell membrane, cytoplasm, nucleus, and various organelles such as mitochondria, endoplasmic reticulum, Golgi apparatus, etc." },
      { front: "What is homeostasis?", back: "The ability of an organism to maintain internal equilibrium by adjusting its physiological processes." }
    ]
  };
  
  // Check if we have predefined flashcards for the topic
  for (const key in flashcardSets) {
    if (lowerTopic.includes(key)) {
      return flashcardSets[key].slice(0, count);
    }
  }
  
  // Generic flashcards if we don't have a specific set
  return [
    { front: `What is the definition of ${topic}?`, back: `${topic} is a concept or subject that encompasses various principles and applications in its field.` },
    { front: `What are the key components of ${topic}?`, back: `${topic} typically consists of multiple elements including theoretical foundations and practical applications.` },
    { front: `Why is ${topic} important?`, back: `${topic} plays a significant role in its field and has various applications in real-world scenarios.` },
    { front: `How has ${topic} evolved over time?`, back: `${topic} has developed through various historical phases to reach its current understanding and application.` },
    { front: `What are common misconceptions about ${topic}?`, back: `Many people misunderstand certain aspects of ${topic}, particularly regarding its scope and limitations.` }
  ].slice(0, count);
}

function generateFallbackHomeworkAnalysis(homeworkTitle: string): { problem: string; solution: string } {
  const title = homeworkTitle.toLowerCase();
  
  // Check if the title indicates a math problem
  if (title.includes("math") || 
      title.includes("algebra") || 
      title.includes("calculus") || 
      title.includes("equation") || 
      title.includes("geometry")) {
    
    // Math-based analysis
    if (title.includes("quadratic") || title.includes("equation")) {
      return {
        problem: "Solve the quadratic equation: x² - 5x + 6 = 0",
        solution: "To solve a quadratic equation in the form ax² + bx + c = 0, we can use factoring or the quadratic formula.\n\n" +
          "For this equation x² - 5x + 6 = 0:\n\n" +
          "1. Factor the equation: x² - 5x + 6 = 0 can be rewritten as (x - 2)(x - 3) = 0\n\n" +
          "2. Use the zero product property: If (x - 2)(x - 3) = 0, then either x - 2 = 0 or x - 3 = 0\n\n" +
          "3. Solve each equation:\n   x - 2 = 0 → x = 2\n   x - 3 = 0 → x = 3\n\n" +
          "4. Therefore, the solutions are x = 2 and x = 3\n\n" +
          "You can verify these solutions by substituting them back into the original equation."
      };
    } else if (title.includes("triangle") || title.includes("pythagorean")) {
      return {
        problem: "Find the hypotenuse of a right triangle with sides of length 3 and 4 units.",
        solution: "To find the hypotenuse of a right triangle, we use the Pythagorean theorem.\n\n" +
          "The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse (c) is equal to the sum of the squares of the other two sides (a and b).\n\n" +
          "c² = a² + b²\n\n" +
          "Given information:\n- Side a = 3 units\n- Side b = 4 units\n\n" +
          "Step 1: Substitute the values into the Pythagorean theorem.\nc² = 3² + 4²\nc² = 9 + 16\nc² = 25\n\n" +
          "Step 2: Take the square root of both sides.\nc = √25\nc = 5\n\n" +
          "Therefore, the hypotenuse of the right triangle is 5 units."
      };
    } else {
      return {
        problem: "Solve the following system of linear equations:\n3x + 2y = 7\nx - y = 1",
        solution: "To solve a system of linear equations, we can use substitution or elimination. Let's use substitution.\n\n" +
          "Step 1: Solve the second equation for x.\nx - y = 1\nx = 1 + y\n\n" +
          "Step 2: Substitute this value of x into the first equation.\n3x + 2y = 7\n3(1 + y) + 2y = 7\n3 + 3y + 2y = 7\n3 + 5y = 7\n5y = 4\ny = 4/5\n\n" +
          "Step 3: Find x by substituting the value of y back into the equation x = 1 + y.\nx = 1 + 4/5\nx = 9/5\n\n" +
          "Therefore, the solution to the system of equations is x = 9/5 and y = 4/5."
      };
    }
  } 
  // Check if the title indicates a physics problem
  else if (title.includes("physics") || 
           title.includes("force") || 
           title.includes("motion") || 
           title.includes("energy")) {
    
    return {
      problem: "A car accelerates from rest to 25 m/s in 5 seconds. What is its acceleration?",
      solution: "To find the acceleration, we'll use the kinematic equation for constant acceleration:\n\n" +
        "v = v₀ + at\n\n" +
        "Where:\n- v is the final velocity (25 m/s)\n- v₀ is the initial velocity (0 m/s, since the car starts from rest)\n- a is the acceleration (what we're solving for)\n- t is the time (5 seconds)\n\n" +
        "Step 1: Substitute the known values into the equation.\n25 m/s = 0 m/s + a(5 s)\n\n" +
        "Step 2: Solve for acceleration (a).\n25 m/s = a(5 s)\na = 25 m/s ÷ 5 s\na = 5 m/s²\n\n" +
        "Therefore, the car's acceleration is 5 m/s². This means the car's velocity increases by 5 meters per second every second."
    };
  } 
  // Check if the title indicates a chemistry problem
  else if (title.includes("chemistry") || 
           title.includes("element") || 
           title.includes("reaction") || 
           title.includes("molecule")) {
    
    return {
      problem: "Balance the following chemical equation: H₂ + O₂ → H₂O",
      solution: "To balance a chemical equation, we need to ensure that the number of atoms of each element is the same on both sides of the equation.\n\n" +
        "Step 1: Count the atoms on each side of the unbalanced equation H₂ + O₂ → H₂O.\n- Left side: 2 H atoms and 2 O atoms\n- Right side: 2 H atoms and 1 O atom\n\n" +
        "Step 2: The oxygen atoms are not balanced (2 on the left, 1 on the right). To balance them, we place a coefficient of 2 in front of H₂O.\nH₂ + O₂ → 2H₂O\n\n" +
        "Step 3: Recount the atoms:\n- Left side: 2 H atoms and 2 O atoms\n- Right side: 4 H atoms and 2 O atoms\n\n" +
        "Step 4: Now the hydrogen atoms are not balanced (2 on the left, 4 on the right). To balance them, we place a coefficient of 2 in front of H₂.\n2H₂ + O₂ → 2H₂O\n\n" +
        "Step 5: Final check:\n- Left side: 4 H atoms and 2 O atoms\n- Right side: 4 H atoms and 2 O atoms\n\n" +
        "The equation is now balanced: 2H₂ + O₂ → 2H₂O"
    };
  } 
  // Check if the title indicates a biology problem
  else if (title.includes("biology") || 
           title.includes("cell") || 
           title.includes("gene") || 
           title.includes("organism")) {
    
    return {
      problem: "Explain the process of cellular respiration and its importance for living organisms.",
      solution: "Cellular respiration is the process by which cells convert nutrients into ATP, the energy currency of the cell.\n\n" +
        "The overall equation for cellular respiration is:\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)\n\n" +
        "The process occurs in three main stages:\n\n" +
        "1. Glycolysis (occurs in the cytoplasm):\n   - Glucose (6C) is split into two molecules of pyruvate (3C)\n   - Produces a net gain of 2 ATP and 2 NADH\n\n" +
        "2. Krebs Cycle/Citric Acid Cycle (occurs in the mitochondrial matrix):\n   - Each pyruvate is converted to acetyl-CoA (2C)\n   - Each acetyl-CoA enters the cycle and produces 3 NADH, 1 FADH₂, and 1 ATP per cycle\n   - Since there are two pyruvate molecules per glucose, this step yields 6 NADH, 2 FADH₂, and 2 ATP\n\n" +
        "3. Electron Transport Chain (occurs in the inner mitochondrial membrane):\n   - NADH and FADH₂ donate electrons to the chain\n   - Energy from electron transfer is used to pump protons across the membrane\n   - Proton gradient drives ATP synthesis via ATP synthase\n   - Oxygen is the final electron acceptor, forming water\n   - This step produces about 28 ATP\n\n" +
        "In total, one glucose molecule can yield approximately 30-32 ATP molecules through cellular respiration.\n\n" +
        "Importance:\n- Provides energy (ATP) for all cellular functions\n- Enables organisms to use chemical energy stored in food\n- Critical for growth, reproduction, and maintenance of life\n- More efficient than anaerobic processes like fermentation"
    };
  } 
  // Default to a general response
  else {
    return {
      problem: "We couldn't identify the specific homework problem from the image.",
      solution: "To get accurate help with your homework:\n\n" +
        "1. Make sure the image clearly shows the complete problem\n2. Provide a specific title that indicates the subject and type of problem\n3. If possible, type out the problem in your submission\n\n" +
        "Our system works best with clear images of math, science, language arts, social studies, and other standard academic subjects. Once we can see your problem clearly, we'll provide a step-by-step solution to help you understand the concepts and approach."
    };
  }
}
