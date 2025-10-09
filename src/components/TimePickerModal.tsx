import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Typography, Spacing, BorderRadius } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  initialTime: string;
  title?: string;
}

const convertTo24Hour = (timeString: string): { hours: number; minutes: number } => {
  // Format can be HH:MM or H:MM
  const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
  return { hours: hours || 0, minutes: minutes || 0 };
};

const formatTimeString = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onSave,
  initialTime,
  title = 'Sélectionner l\'heure',
}) => {
  const { colors } = useThemeMode();
  const { hours: initialHours, minutes: initialMinutes } = convertTo24Hour(initialTime);
  
  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  const handleSave = () => {
    onSave(formatTimeString(hours, minutes));
    onClose();
  };

  const overlayStyle = [styles.modalOverlay, { backgroundColor: colors.overlay }];
  const modalContentStyle = [styles.modalContent, { backgroundColor: colors.surface }];
  const pickerBackground = { backgroundColor: colors.secondaryBackground };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={overlayStyle}>
        <View style={modalContentStyle}>
          <View style={styles.header}>
            <Text style={[Typography.h3, { color: colors.text }]}>{title}</Text>
          </View>
          
          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={[Typography.bodySmall, { color: colors.textLight }]}>Heures</Text>
              <View style={[styles.picker, pickerBackground]}>
                {hourOptions.map((hour) => (
                  <TouchableOpacity
                    key={`hour-${hour}`}
                    style={[styles.pickerItem, hours === hour && styles.selectedItem]}
                    onPress={() => setHours(hour)}
                  >
                    <Text 
                      style={[
                        Typography.body, 
                        { color: hours === hour ? colors.primary : colors.text },
                        hours === hour && styles.selectedText
                      ]}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Text style={[Typography.h3, { color: colors.text, marginHorizontal: Spacing.md }]}>:</Text>
            
            <View style={styles.pickerColumn}>
              <Text style={[Typography.bodySmall, { color: colors.textLight }]}>Minutes</Text>
              <View style={[styles.picker, pickerBackground]}>
                {minuteOptions.map((minute) => (
                  <TouchableOpacity
                    key={`minute-${minute}`}
                    style={[styles.pickerItem, minutes === minute && styles.selectedItem]}
                    onPress={() => setMinutes(minute)}
                  >
                    <Text 
                      style={[
                        Typography.body, 
                        { color: minutes === minute ? colors.primary : colors.text },
                        minutes === minute && styles.selectedText
                      ]}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={[Typography.button, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              <Text style={[Typography.button, { color: colors.textDark }]}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  picker: {
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(194, 99, 58, 0.15)',
  },
  selectedText: {
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: Spacing.sm,
  },
  saveButton: {
    marginLeft: Spacing.sm,
  },
});