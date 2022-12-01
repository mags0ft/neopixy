import dayjs, { Dayjs } from 'dayjs';
import { Dimensions, View } from 'react-native';
import { t } from '../../helpers/translation';
import { useLogState } from '../../hooks/useLogs';
import { getRatingDistributionForYear } from '../../hooks/useStatistics/RatingDistribution';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { BigCard } from '../../components/BigCard';
import { RatingChart } from '../../components/RatingChart';
import { CardFeedback } from '../../components/Statistics/CardFeedback';
import { NotEnoughDataOverlay } from '../../components/Statistics/NotEnoughDataOverlay';
import { useRef } from 'react';
import _ from 'lodash';

dayjs.extend(isSameOrAfter);

const MIN_ITEMS = 5;

export const MoodChart = ({
  date,
}: {
  date: Dayjs,
}) => {
  const logState = useLogState();

  const items = logState.items.filter(item => {
    return dayjs(item.dateTime).isSame(date, 'year')
  })

  const dataDummy = useRef(_.range(0, 11).map((i) => ({
    key: dayjs().month(i).format('MMM')[0],
    count: _.random(3, 6),
    value: _.random(1, 6),
  })))

  const data = getRatingDistributionForYear(items)
  const validatedData = data.filter(d => d.value !== null)

  const width = Dimensions.get('window').width - 80;
  const height = width / 2.5;

  return (
    <BigCard
      title={t('statistics_mood_chart')}
      subtitle={t('statistics_mood_chart_description', { date: date.format('YYYY') })}
      isShareable={true}
      analyticsId="rating-distribution"
    >
      {validatedData.length < MIN_ITEMS && (
        <NotEnoughDataOverlay limit={MIN_ITEMS - validatedData.length} />
      )}
      {validatedData.length >= MIN_ITEMS ? (
        <RatingChart
          data={data}
          height={height}
          width={width} />
      ) : (
        <RatingChart
          data={dataDummy.current}
          height={height}
          width={width} />
      )}

      <CardFeedback
        type='rating_distribution_year'
        details={data}
      />
    </BigCard>
  );
};