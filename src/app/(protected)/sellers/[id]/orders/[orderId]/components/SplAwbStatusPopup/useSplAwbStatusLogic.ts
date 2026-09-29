import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Clock,
  FileText,
  HelpCircle,
  CircleCheck,
  AlertCircle,
} from 'lucide-react';

import { logError } from '@/utils/errorLogger';

export type ShippingStatus =
  | 'delay'
  | 'ready-to-ship'
  | 'generating'
  | 'accept'
  | 'accept-upload'
  | 'ready-download'
  | 'upload-awb'
  | 'upload-proof'
  | 'mark-shipped';

interface UseSplAwbStatusLogicProps {
  open: boolean;
  shippingType: 'awb' | 'order';
  status: ShippingStatus;
  remainingTime?: string;
  awbRequestedAt?: string;
  onStatusChange?: (status: ShippingStatus) => void;
  defaultCarrier?: string;
}

interface IconConfig {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
}

interface ContentConfig {
  title: string;
  description: string;
  bullets: string[];
  showInfo: boolean;
  infoText?: string;
  /** Present for `generating` status */
  showTimer?: boolean;
}

export function useSplAwbStatusLogic({
  open,
  shippingType,
  status,
  remainingTime = '00:50:27',
  awbRequestedAt,
  onStatusChange,
  defaultCarrier,
}: UseSplAwbStatusLogicProps) {
  const t = useTranslations('shippingStatusPopup');

  const [awbFile, setAwbFile] = useState<File | null>(null);
  const [carrier, setCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [trackingUrlError, setTrackingUrlError] = useState<string>('');
  const [currentRemainingTime, setCurrentRemainingTime] = useState<string>('');

  useEffect(() => {
    if (!open || status !== 'generating') {
      setCurrentRemainingTime('');
      return;
    }

    const calculateRemainingTime = (): string => {
      if (!awbRequestedAt) {
        return remainingTime || '00:00:00';
      }

      try {
        const requestedAt = new Date(awbRequestedAt);
        const oneHourLater = new Date(requestedAt.getTime() + 60 * 60 * 1000);
        const now = new Date();
        const diffMs = oneHourLater.getTime() - now.getTime();

        if (diffMs <= 0) {
          return '00:00:00';
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } catch (error) {
        logError('Error calculating remaining time', error);
        return remainingTime || '00:00:00';
      }
    };

    const initialTime = calculateRemainingTime();
    setCurrentRemainingTime(initialTime);

    if (
      initialTime === '00:00:00' &&
      status === 'generating' &&
      onStatusChange
    ) {
      onStatusChange('delay');
    }

    const interval = setInterval(() => {
      const newTime = calculateRemainingTime();
      setCurrentRemainingTime(newTime);

      if (newTime === '00:00:00' && status === 'generating' && onStatusChange) {
        onStatusChange('delay');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, status, awbRequestedAt, remainingTime, onStatusChange]);

  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true;
    try {
      let urlToValidate = url.trim();

      if (/^\d+$/.test(urlToValidate) || !/[a-zA-Z]/.test(urlToValidate)) {
        return false;
      }

      const protocolRegex = /^https?:\/\//i;
      if (!protocolRegex.exec(urlToValidate)) {
        urlToValidate = 'https://' + urlToValidate;
      }
      const urlObj = new URL(urlToValidate);
      const hostname = urlObj.hostname;
      if (!hostname || hostname.length === 0) return false;

      const parts = hostname.split('.');
      if (parts.length < 2) return false;

      const tld = parts.at(-1);
      if (!tld || tld.length < 2 || !/[a-zA-Z]/.test(tld)) return false;

      const domain = parts[0];
      if (!domain || /^\d+$/.test(domain)) return false;

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!open) return;
    if (status === 'upload-awb' || status === 'upload-proof') {
      setAwbFile(null);
    }
    if (status === 'mark-shipped') {
      setCarrier(defaultCarrier ?? '');
      setTrackingNumber('');
      setTrackingUrl('');
      setTrackingUrlError('');
    }
  }, [open, status, defaultCarrier]);

  const isUploadAwb = useMemo(
    () => shippingType === 'awb' && status === 'upload-awb',
    [shippingType, status],
  );

  const isMarkShipped = useMemo(
    () => shippingType === 'awb' && status === 'mark-shipped',
    [shippingType, status],
  );

  const isAcceptUpload = useMemo(
    () => shippingType === 'awb' && status === 'accept-upload',
    [shippingType, status],
  );

  const isUploadProof = useMemo(
    () => shippingType === 'awb' && status === 'upload-proof',
    [shippingType, status],
  );

  const getIconConfig = (): IconConfig => {
    switch (status) {
      case 'delay':
      case 'generating':
        return {
          Icon: Clock,
          bgColor: 'bg-mds-secondary-100',
          iconColor: 'text-mds-secondary-600',
        };
      case 'ready-to-ship':
        return {
          Icon: FileText,
          bgColor: 'bg-mds-secondary-100',
          iconColor: 'text-mds-secondary-600',
        };
      case 'accept':
      case 'accept-upload':
        return {
          Icon: HelpCircle,
          bgColor: 'bg-[#FFF7E6]',
          iconColor: 'text-[#B45309]',
        };
      case 'ready-download':
        return {
          Icon: CircleCheck,
          bgColor: 'bg-mds-success-100',
          iconColor: 'text-mds-success-500',
        };
      default:
        return {
          Icon: AlertCircle,
          bgColor: 'bg-mds-secondary-100',
          iconColor: 'text-mds-secondary-600',
        };
    }
  };

  const getContent = (): ContentConfig => {
    const isAWB = shippingType === 'awb';
    const docType = isAWB
      ? t('documentTypes.awb')
      : t('documentTypes.document');
    const docTypeLong = isAWB
      ? t('documentTypes.awbLong')
      : t('documentTypes.order');

    switch (status) {
      case 'delay':
        return {
          title: t('delay.title', { docType }),
          description: t('delay.description', { docTypeLong }),
          bullets: [
            t('delay.bullet1', { docType }),
            t('delay.bullet2', { docType }),
            t('delay.bullet3'),
          ],
          showInfo: false,
        };
      case 'ready-to-ship':
        return {
          title: t('readyToShip.title', { docType }),
          description: t('readyToShip.description', { docType }),
          bullets: [
            t('readyToShip.bullet1', { docType }),
            t('readyToShip.bullet2', { docType }),
          ],
          showInfo: true,
          infoText: t('readyToShip.infoText', { docType }),
        };
      case 'generating':
        return {
          title: t('generating.title', { docType }),
          description: t('generating.description', { docTypeLong }),
          bullets: [
            t('generating.bullet1', { docType }),
            t('generating.bullet2', { docType }),
            t('generating.bullet3'),
            t('generating.bullet4', { docType }),
          ],
          showInfo: false,
          showTimer: true,
        };
      case 'accept':
        return {
          title: t('accept.title'),
          description: t('accept.description', { docType }),
          bullets: [],
          showInfo: false,
        };
      case 'accept-upload':
        return {
          title: t('acceptUpload.title'),
          description: t('acceptUpload.description'),
          bullets: [],
          showInfo: false,
        };
      case 'ready-download':
        return {
          title: t('readyDownload.title', { docType }),
          description: t('readyDownload.description', { docTypeLong }),
          bullets: [],
          showInfo: false,
        };
      default:
        return {
          title: t('default.title'),
          description: t('default.description'),
          bullets: [],
          showInfo: false,
        };
    }
  };

  return {
    awbFile,
    setAwbFile,
    carrier,
    setCarrier,
    trackingNumber,
    setTrackingNumber,
    trackingUrl,
    setTrackingUrl,
    trackingUrlError,
    setTrackingUrlError,
    currentRemainingTime,
    isUploadAwb,
    isUploadProof,
    isMarkShipped,
    isAcceptUpload,
    isValidUrl,
    getIconConfig,
    getContent,
  };
}
