import Button from "@/components/Button";
import { STATISTIC_MIN_LOGS } from "@/constants/Config";
import { t } from "@/helpers/translation";
import useColors from "@/hooks/useColors";
import { useLogState } from "@/hooks/useLogs";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { PlusCircle } from "react-native-feather";
import { PromoCards } from "./PromoCards";

export const CalendarFooter = () => {
  const colors = useColors();
  const logState = useLogState();
  const navigation = useNavigation();

  const statisticsUnlocked = logState.items.length >= STATISTIC_MIN_LOGS;

  const hasTodayItem = logState.items.find(item => {
    return dayjs(item.dateTime).isSame(dayjs(), 'day');
  });

  return (
    <View
      style={{}}
    >
      <View
        style={{
          marginTop: 24,
        }}
      >
        {!hasTodayItem ? (
          <Button
            icon={<PlusCircle width={24} height={24} color={colors.primaryButtonText} />}
            onPress={() => {
              navigation.navigate("LogCreate", {
                date: dayjs().format("YYYY-MM-DD"),
              });
            }}
          >{t('add_today_entry')}</Button>
        ) : (

          <Button
            icon={<PlusCircle width={24} height={24} color={colors.tertiaryButtonText} />}
            type="tertiary"
            onPress={() => {
              navigation.navigate("LogCreate", {
                date: dayjs().format("YYYY-MM-DD"),
              });
            }}
          >{t('add_today_another_entry')}</Button>
        )}
      </View>
      {statisticsUnlocked && (
        <PromoCards />
      )}
    </View>
  );
};