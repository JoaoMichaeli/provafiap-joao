import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import questions from '../../assets/questions.json';

const Quiz = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const QUESTIONS_PER_THEME = 5;

  useEffect(() => {
    prepareQuiz();
  }, []);

  const prepareQuiz = async () => {
    try {
      const themes = Object.keys(questions);
      let allQuestions = [];

      themes.forEach((theme) => {
        const themeQuestions = questions[theme] || [];
        const shuffled = shuffleArray(themeQuestions);
        allQuestions = [...allQuestions, ...shuffled.slice(0, QUESTIONS_PER_THEME)];
      });

      const finalQuestions = shuffleArray(allQuestions).map((question) => ({
        ...question,
        theme: themes.find((theme) => questions[theme].includes(question)),
      }));
      
      setSelectedQuestions(finalQuestions);
      setAnswers(new Array(finalQuestions.length).fill(null));
      setIsLoading(false);
    } catch (error) {
      console.error('Error preparing quiz:', error.message);
      setIsLoading(false);
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleAnswer = (selectedOption) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = selectedOption;
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      navigation.navigate('ReviewAnswers', { selectedQuestions, answers });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6641F3" />
      </View>
    );
  }

  const currentQ = selectedQuestions[currentQuestion];
  const hasAnswered = answers[currentQuestion] !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.theme}>
          Theme: {currentQ.theme.charAt(0).toUpperCase() + currentQ.theme.slice(1)}
        </Text>
        <Text style={styles.questionCount}>
          Question {currentQuestion + 1}/{selectedQuestions.length}
        </Text>
        <Text style={styles.question} testID="question-text">
          {currentQ.question}
        </Text>
        
        {currentQ.answers.map((option, index) => {
          const isCorrect = index === currentQ.correctAnswer;
          const isSelected = answers[currentQuestion] === index;
          const showResults = hasAnswered;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                isSelected && styles.selectedButton,
                showResults && isCorrect && styles.correctAnswer,
                showResults && isSelected && !isCorrect && styles.wrongAnswer,
              ]}
              onPress={() => !showResults && handleAnswer(index)}
              disabled={showResults}
            >
              <Text style={styles.buttonText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        {hasAnswered && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion < selectedQuestions.length - 1 
                ? 'Próxima Questão ➔' 
                : 'Finalizar Quiz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navigationBar}>
        <ScrollView horizontal>
          {selectedQuestions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navButton,
                currentQuestion === index && styles.currentNavButton,
                answers[index] !== null && styles.answeredNavButton,
              ]}
              onPress={() => setCurrentQuestion(index)}
            >
              <Text style={styles.navButtonText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  theme: {
    fontSize: 18,
    color: '#6641F3',
    marginBottom: 10,
  },
  questionCount: {
    fontSize: 16,
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6641F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  correctAnswer: {
    backgroundColor: '#4CAF50',
  },
  wrongAnswer: {
    backgroundColor: '#FF5733',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#6641F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationBar: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  navButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  currentNavButton: {
    backgroundColor: '#6641F3',
  },
  answeredNavButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Quiz;