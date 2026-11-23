export interface FireProps {
  /** Fire radiative power in megawatts: how much heat the fire gives off. */
  frp: number;
  /** Day of the satellite pass, YYYY-MM-DD (UTC). */
  date: string;
  /** Time of the satellite pass, HHMM (UTC). */
  time: string;
  night: boolean;
  country: string;
}

export interface Meta {
  count: number;
  from: string;
  to: string;
}

export type Mode = 'heatmap' | 'clusters';
