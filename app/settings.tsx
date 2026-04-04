import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDatabase } from '../src/hooks/useDatabase';
import { useAlert } from '../src/hooks/useAlert';
import CustomAlert from '../src/components/CustomAlert';
import {
  getNotificationSettings,
  saveNotificationWindow,
  scheduleNextNotification,
} from '../src/services/notification.service';
import { exportData, exportPhotosToGallery, pickAndImportData } from '../src/services/backup.service';
import { colors, fontSize, spacing, borderRadius } from '../src/constants/theme';

export default function SettingsScreen() {
  const db = useDatabase();
  const [windowStart, setWindowStart] = useState(9);
  const [windowEnd, setWindowEnd] = useState(21);
  const [nextNotification, setNextNotification] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPhotos, setExportingPhotos] = useState(false);
  const [importing, setImporting] = useState(false);
  const { alertProps, showAlert } = useAlert();

  useEffect(() => {
    getNotificationSettings(db).then((settings) => {
      setWindowStart(settings.windowStart);
      setWindowEnd(settings.windowEnd);
      setNextNotification(settings.nextNotification);
    }).catch(() => {});
  }, [db]);

  const adjustHour = async (type: 'start' | 'end', delta: number) => {
    let newStart = windowStart;
    let newEnd = windowEnd;

    if (type === 'start') {
      newStart = Math.max(0, Math.min(23, windowStart + delta));
      if (newStart >= newEnd) return;
    } else {
      newEnd = Math.max(1, Math.min(24, windowEnd + delta));
      if (newEnd <= newStart) return;
    }

    setWindowStart(newStart);
    setWindowEnd(newEnd);
    try {
      await saveNotificationWindow(db, newStart, newEnd);
      await scheduleNextNotification(db, newStart, newEnd);
      const settings = await getNotificationSettings(db);
      setNextNotification(settings.nextNotification);
    } catch {
      // Settings save failed — UI already updated, will retry on next adjustment
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reglages</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Fenetre horaire</Text>
          <Text style={styles.description}>
            L'heure de la notification quotidienne sera choisie aleatoirement dans cette plage.
          </Text>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>De</Text>
            <TouchableOpacity onPress={() => adjustHour('start', -1)} style={styles.timeButton}>
              <Ionicons name="remove" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.timeValue}>{windowStart}h00</Text>
            <TouchableOpacity onPress={() => adjustHour('start', 1)} style={styles.timeButton}>
              <Ionicons name="add" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>A</Text>
            <TouchableOpacity onPress={() => adjustHour('end', -1)} style={styles.timeButton}>
              <Ionicons name="remove" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.timeValue}>{windowEnd}h00</Text>
            <TouchableOpacity onPress={() => adjustHour('end', 1)} style={styles.timeButton}>
              <Ionicons name="add" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {nextNotification && (
            <Text style={styles.nextNotif}>
              Prochaine notification :{' '}
              {format(parseISO(nextNotification), "EEEE d MMMM 'a' HH:mm", { locale: fr })}
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Donnees</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Sauvegarder les donnees</Text>
          <Text style={styles.description}>
            Exporte tes statistiques, badges et defis dans un fichier JSON.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              setExporting(true);
              try {
                await exportData(db);
              } catch {
                showAlert({
                  title: 'Erreur',
                  message: "L'export a echoue. Reessaye.",
                  icon: 'alert-circle-outline',
                });
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            activeOpacity={0.7}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Exporter les donnees</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { marginTop: spacing.md }]}>
          <Text style={styles.label}>Sauvegarder les photos</Text>
          <Text style={styles.description}>
            Enregistre toutes tes photos dans la galerie de ton telephone.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              setExportingPhotos(true);
              try {
                const count = await exportPhotosToGallery(db);
                showAlert({
                  title: 'Photos exportees',
                  message: `${count} photo${count > 1 ? 's' : ''} enregistree${count > 1 ? 's' : ''} dans ta galerie.`,
                  icon: 'checkmark-circle',
                  iconColor: colors.success,
                });
              } catch {
                showAlert({
                  title: 'Erreur',
                  message: "L'export des photos a echoue. Verifie les permissions.",
                  icon: 'alert-circle-outline',
                });
              } finally {
                setExportingPhotos(false);
              }
            }}
            disabled={exportingPhotos}
            activeOpacity={0.7}
          >
            {exportingPhotos ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="images-outline" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Exporter les photos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { marginTop: spacing.md }]}>
          <Text style={styles.label}>Restaurer une sauvegarde</Text>
          <Text style={styles.description}>
            Importe des donnees depuis un fichier de sauvegarde Hestia.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              setImporting(true);
              try {
                const result = await pickAndImportData(db);
                if (result) {
                  showAlert({
                    title: 'Import termine',
                    message: `${result.photosImported} photo${result.photosImported > 1 ? 's' : ''} et ${result.badgesImported} badge${result.badgesImported > 1 ? 's' : ''} importes.`,
                    icon: 'checkmark-circle',
                    iconColor: colors.success,
                  });
                }
              } catch {
                showAlert({
                  title: 'Erreur',
                  message: "Le fichier n'est pas valide ou l'import a echoue.",
                  icon: 'alert-circle-outline',
                });
              } finally {
                setImporting(false);
              }
            }}
            disabled={importing}
            activeOpacity={0.7}
          >
            {importing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="push-outline" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Importer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    width: 30,
  },
  timeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '300',
    minWidth: 60,
    textAlign: 'center',
  },
  nextNotif: {
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  actionText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
