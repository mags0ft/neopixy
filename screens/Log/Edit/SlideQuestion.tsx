import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { QUESTION_SUBMIT_URL } from '../../../constants/API';
import useColors from "../../../hooks/useColors";
import useHaptics from "../../../hooks/useHaptics";
import { useSettings } from "../../../hooks/useSettings";
import { useTranslation } from "../../../hooks/useTranslation";
import pkg from '../../../package.json';
import { SlideHeadline } from "./SlideHeadline";

export interface IQuestion {
  id: string;
  text: {
    en: string;
    de?: string;
  };
  type: 'single' | 'multiple';
  answers: {
    id: string;
    emoji: string;
    text: {
      en: string;
      de?: string;
    } | null;
  }[]
}

const AnswerSelector = ({
  answer,
  selected,
  onPress,
}: {
  answer: IQuestion['answers'][0];
  selected: boolean;
  onPress: (answer) => void;
}) => {
  const { language } = useTranslation()
  const colors = useColors();
  const haptics = useHaptics();
  
  const answerText = answer.text[language] || answer.text['en'];
  
  return (
    <Pressable 
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        borderRadius: 8,
        backgroundColor: colors.logActionBackground,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderWidth: 2,
        borderColor: selected ? colors.logActionBorder : 'transparent',
        aspectRatio: 1,
        width: 150,
        marginHorizontal: 8,
      })}
      onPress={async () => {
        await haptics.selection()
        onPress(answer)
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text 
          numberOfLines={1}
          style={{ 
            fontSize: 32, 
            textAlign: 'center',
          }}
        >
          {answer.emoji}
        </Text>
      </View>
        {![undefined, '', null].includes(answerText) && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8, 
            }}
          >
            <Text 
              style={{ 
                fontSize: 17, 
                color: colors.logActionText, 
                textAlign: 'center',
              }}
            >
              {answerText}
            </Text>
          </View>
        )}
    </Pressable>
  )
}

export const SlideQuestion = ({
  marginTop,
  question,
  onPress,
}: {
  marginTop,
  question: IQuestion,
  onPress: () => void,
}) => {
  const { language, locale } = useTranslation()
  const { addActionDone } = useSettings()
  const { settings } = useSettings()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const question_text = question.text[language] || question.text['en'];
  
  const send = async (answers) => {
    const answer_texts = answers.map(answer => {
      if(answer.text[language]) {
        return `${answer.emoji} ${answer.text[language]}`
      } else {
        `${answer.emoji} ${answer.text['en']}`
      }
    }).join(', ')
    
    const metaData = {
      locale: locale,
      version: pkg.version,
      os: Platform.OS,
      deviceId: settings.deviceId,
    }
    
    const body = {
      date: new Date().toISOString(),
      language,
      question_text,
      answer_texts,
      answer_ids: answers.map(answer => answer.id).join(', '),
      question,
      ...metaData,
    }

    console.log('Sending Question Feedback', body)

    if(__DEV__) {
      console.log('Not sending Question Feedback in dev mode')
      addActionDone(`question_slide_${question.id}`)
      return
    }
    
    return fetch(QUESTION_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then(() => {
      addActionDone(`question_slide_${question.id}`)
    })
  }
  
  const onAnswer = (answer: IQuestion['answers'][0]) => {
    setSelectedIds([answer.id])
    send([answer])
    onPress()
  }
  
  return (
    <View style={{ 
      flex: 1, 
      width: '100%',
    }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SlideHeadline>{question.text[language] || question.text['en']}</SlideHeadline>
        <View
          style={{
            padding: 32,
          }}
        >
          <View style={{
            flexDirection: 'row', 
          }}>
            {question.answers.slice(0, 2).map((answer) => (
              <AnswerSelector
                key={answer.id}
                answer={answer}
                selected={selectedIds.includes(answer.id)}
                onPress={onAnswer}
              />
            ))}
          </View>
          <View style={{
            marginTop: 16,
            flexDirection: 'row', 
          }}>
            {question.answers.slice(2, 4).map((answer) => (
              <AnswerSelector
                key={answer.id}
                answer={answer}
                selected={selectedIds.includes(answer.id)}
                onPress={onAnswer}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}