import dayjs from 'dayjs';
import { t } from 'i18n-js';
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, Text, View } from 'react-native';
import { Trash, X } from 'react-native-feather';
import Carousel from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useColors from '../../hooks/useColors';
import useHaptics from '../../hooks/useHaptics';
import { LogItem, useLogs } from '../../hooks/useLogs';
import { useSegment } from '../../hooks/useSegment';
import { useSettings } from '../../hooks/useSettings';
import { useTemporaryLog } from '../../hooks/useTemporaryLog';
import { useTranslation } from '../../hooks/useTranslation';
import { RootStackScreenProps } from '../../types';
import { SlideAction } from './SlideAction';
import { SlideHeader } from './SlideHeader';
import { SlideNote } from './SlideNote';
import { SlideRating } from './SlideRating';
import { SlideTags } from './SlideTags';
import { Stepper } from './Stepper';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export const LogModal = ({ navigation, route }: RootStackScreenProps<'Log'>) => {
  
  const { settings } = useSettings()
  const colors = useColors()
  const i18n = useTranslation()
  const segment = useSegment()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets();

  const { state, dispatch } = useLogs()
  const tempLog = useTemporaryLog();
  
  const defaultLogItem: LogItem = {
    date: route.params.date,
    rating: null,
    message: '',
    tags: [],
  }
  
  const existingLogItem = state?.items[route.params.date];

  useEffect(() => {
    tempLog.set(existingLogItem || defaultLogItem)
  }, [])

  const onClose = () => {
    tempLog.reset()
  }
  
  const save = () => {
    segment.track('log_saved', {
      date: tempLog.data.date,
      messageLength: tempLog.data.message.length,
      rating: tempLog.data.rating,
      tags: tempLog?.data?.tags.map(tag => ({
        ...tag,
        title: undefined
      })),
    })
    if(existingLogItem) {
      segment.track('log_changed', {
        date: tempLog.data.date,
        messageLength: tempLog.data.message.length,
        rating: tempLog.data.rating,
        tags: tempLog?.data?.tags.map(tag => ({
          ...tag,
          title: undefined
        })),
      })
    } else {
      segment.track('log_created', {
        date: tempLog.data.date,
        messageLength: tempLog.data.message.length,
        rating: tempLog.data.rating,
        tags: tempLog?.data?.tags.map(tag => ({
          ...tag,
          title: undefined
        })),
      })
    }

    dispatch({
      type: existingLogItem ? 'edit' : 'add',
      payload: tempLog.data
    })

    if(
      Object.keys(state.items).length === 2 &&
      !settings.reminderEnabled
    ) {
      segment.track('reminder_modal_open')
      navigation.navigate('ReminderModal');
    } else {
      navigation.navigate('Calendar');
    }

    onClose()
  }

  const askToRemove = () => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        t('delete_confirm_title'),
        t('delete_confirm_message'),
        [
          {
            text: t('delete'),
            onPress: () => resolve({}),
            style: "destructive"
          },
          { 
            text: t('cancel'), 
            onPress: () => reject(),
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
    })
  }
  
  const remove = () => {
    segment.track('log_deleted')
    dispatch({
      type: 'delete', 
      payload: tempLog.data
    })
    navigation.navigate('Calendar');
    onClose()
  }

  const cancel = () => {
    segment.track('log_cancled')
    navigation.navigate('Calendar');
    onClose()
  }

  const trackMessageChange = useCallback(debounce(() => {
    segment.track('log_message_changed', {
      messageLength: tempLog.data.message.length
    })
  }, 1000), []);

  const setRating = (rating: LogItem['rating']) => {
    segment.track('log_rating_changed', {
      label: rating
    })
    tempLog.set((logItem) => ({ ...logItem, rating }))
  }
  const setMessage = (message: LogItem['message']) => {
    trackMessageChange()
    tempLog.set(logItem => ({ ...logItem, message }))
  }
  
  const placeholder = useRef(i18n.t(`log_modal_message_placeholder_${randomInt(1, 6)}`))

  const [slideIndex, setSlideIndex] = useState(0)
  const _carousel = useRef(null);
  const [touched, setTouched] = useState(false)
  
  const slides = [
    <SlideRating next={() => _carousel.current.next()} />,
    <SlideTags next={() => _carousel.current.next()} />,
    <SlideNote save={() => save()} />,
  ]
  
  return (
    <View style={{ 
      flex: 1,
      backgroundColor: colors.logBackground,
    }}>
      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        {(slideIndex !== 0 || touched) && (
          <SlideAction 
            slides={slides} 
            slideIndex={slideIndex} 
            save={save} 
            next={() => _carousel.current.next()} 
          />
        )}
        <Stepper count={slides.length} index={slideIndex} />
        <SlideHeader
          left={<Text style={{ fontSize: 17, fontWeight: '600', color: colors.logHeaderText }}>{dayjs(route.params.date).isSame(dayjs(), 'day') ? t('today') : dayjs(route.params.date).format('ddd, L')}</Text>}
          right={
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              {existingLogItem && (
                <Pressable
                  style={{
                    marginRight: 16,
                  }}
                  onPress={async () => {
                    await haptics.selection()
                    if(tempLog.data.message.length > 0) {
                      askToRemove().then(() => remove())
                    } else {
                      remove()
                    }
                  }} 
                >
                  <Trash color={colors.logHeaderText} width={24} height={24} />
                </Pressable>
              )}
              <Pressable
                onPress={async () => {
                  await haptics.selection()
                  cancel()
                }}
              >
                <X color={colors.logHeaderText} width={24} height={24} />
              </Pressable>
            </View>
          }
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <Carousel
            loop={false}
            width={Dimensions.get('window').width - 40}
            ref={_carousel}
            data={slides}
            onSnapToItem={(index) => {
              setTouched(true)
              setSlideIndex(index)
            }}
            renderItem={({ index }) => slides[index]}
          />
        </View>
      </View>
    </View>
  )
}
