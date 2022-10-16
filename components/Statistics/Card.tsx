import _ from "lodash"
import { Text, View } from "react-native"
import useColors from "../../hooks/useColors"

export const Card = ({
  subtitle,
  title,
  children,
}) => {
  const colors = useColors()
  
  return (
    <View style={{
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 20,
      paddingRight: 20,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
      marginTop: 16,
    }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text 
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.statisticsCardSubtitle,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {_.isString(title) ? (
          <Text 
            style={{
              letterSpacing: -0.1,
              lineHeight: 24,
              fontSize: 17,
              fontWeight: 'bold',
              color: colors.text,
            }}
          >
            {title}
          </Text>
        ) : title}
      </View>
      <View style={{
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  )
}
