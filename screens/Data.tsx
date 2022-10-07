import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { Box, Download, Trash2, Upload } from 'react-native-feather';
import MenuList from '../components/MenuList';
import MenuListItem from '../components/MenuListItem';
import TextInfo from '../components/TextInfo';
import { useAnalytics } from "../hooks/useAnalytics";
import useColors from '../hooks/useColors';
import { useDatagate } from '../hooks/useDatagate';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';
import { RootStackScreenProps } from '../types';

export const DataScreen = ({ navigation }: RootStackScreenProps<'Data'>) => {
  const { setSettings } = useSettings()
  const colors = useColors()
  const i18n = useTranslation()
  const analytics = useAnalytics()
  const datagate = useDatagate()

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(analytics.isEnabled())
  
  return (
    <View style={{ 
      flex: 1,
      backgroundColor: colors.background,
    }}>
      <ScrollView
        style={{
          padding: 20,
          flex: 1,
        }}
      >
      <MenuList style={{ marginTop: 20, }}>
        <MenuListItem
          title={i18n.t('webhook')}
          iconLeft={<Box width={18} color={colors.menuListItemIcon} />}
          onPress={() => navigation.navigate('Webhook')}
          testID='webhook'
          isLink
          isLast
        />
        {/* <MenuListItem
          title={i18n.t('scales')}
          iconLeft={<Droplet width={18} color={colors.menuListItemIcon} />}
          onPress={() => navigation.navigate('Scales')}
          isLink
          isLast
        /> */}
      </MenuList>
      <TextInfo>{i18n.t('webhook_help')}</TextInfo>
      <MenuList style={{ marginTop: 16, }}>
        <MenuListItem
          title={i18n.t('import')}
          onPress={() => datagate.openImportDialog()}
          iconLeft={<Upload width={18} color={colors.menuListItemIcon} />}
        />
        <MenuListItem
          title={i18n.t('export')}
          onPress={() => datagate.openExportDialog()}
          iconLeft={<Download width={18} color={colors.menuListItemIcon} />}
          isLast
        />
      </MenuList>
      <TextInfo>{i18n.t('export_help')}</TextInfo>
      <MenuList>
        <MenuListItem
          title={i18n.t('behavioral_data')}
          iconRight={
            <Switch
              ios_backgroundColor={colors.backgroundSecondary}
              onValueChange={() => {
                analytics.track('data_behavioral_toggle', { enabled: !isTrackingEnabled })
                setIsTrackingEnabled(!isTrackingEnabled)
                setSettings((settings) => ({
                  ...settings,
                  analyticsEnabled: !isTrackingEnabled
                }))
                if(!isTrackingEnabled) {
                  analytics.enable()
                } else {
                  analytics.disable()
                }
              }}
              value={isTrackingEnabled}
              testID={`behavioral-data-enabled`}
            />
          }
          isLast
        ></MenuListItem>
      </MenuList>
      <MenuList style={{ marginTop: 16, }}>
        <MenuListItem
          testID='reset-data'
          title={i18n.t('reset_data_button')}
          onPress={() => {
            datagate
              .openResetDialog()
              .then(() => {
                analytics.reset()
                setIsTrackingEnabled(analytics.isEnabled())
              })
              .catch((e) => console.log(e))
          }}
          iconLeft={<Trash2 width={18} color='red' />}
          style={{
            color: 'red'
          }}
          isLast
        />
      </MenuList>
    </ScrollView>
  </View>
  );
}
