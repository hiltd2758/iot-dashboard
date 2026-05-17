import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "https://api.irrigation.studio/ws";

export interface DashboardSummary {
  deviceId: string;
  status: string;
  statusDelay: boolean;
  latestSoilMoisturePercent: number | null;
  latestTemperatureCelsius: number | null;
  latestHumidityPercent: number | null;
  totalWaterAmountMlToday: number | null;
}

export interface SensorState {
  soilMoisture: number | null;
  temperature: number | null;
  humidity: number | null;
  waterToday: number | null;
  deviceStatus: string;
  statusDelay: boolean;
  lastUpdated: Date | null;
  connected: boolean;
}

export interface ChartPoint {
  time: string;
  soilMoisture: number | null;
  temperature: number | null;
  humidity: number | null;
}

export function useStomp(deviceId: string | null) {
  const clientRef = useRef<Client | null>(null);
  const [sensor, setSensor] = useState<SensorState>({
    soilMoisture: null,
    temperature: null,
    humidity: null,
    waterToday: null,
    deviceStatus: "unknown",
    statusDelay: false,
    lastUpdated: null,
    connected: false,
  });
  const [liveChartData, setLiveChartData] = useState<ChartPoint[]>([]);

  const publish = useCallback((destination: string, body: object) => {
    clientRef.current?.publish({ destination, body: JSON.stringify(body) });
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const token = localStorage.getItem("accessToken");

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        setSensor((s) => ({ ...s, connected: true }));
        setLiveChartData([]); // reset khi reconnect

        client.subscribe(`/topic/dashboard/${deviceId}`, (msg) => {
          console.log("STOMP received:", msg.body);
          try {
            const data: DashboardSummary = JSON.parse(msg.body);
            const now = new Date();

            setSensor((s) => ({
              ...s,
              soilMoisture: data.latestSoilMoisturePercent,
              temperature: data.latestTemperatureCelsius,
              humidity: data.latestHumidityPercent,
              waterToday: data.totalWaterAmountMlToday,
              deviceStatus: data.status,
              statusDelay: data.statusDelay,
              lastUpdated: now,
            }));

            setLiveChartData((prev) => {
              const point: ChartPoint = {
                time: now.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                soilMoisture: data.latestSoilMoisturePercent,
                temperature: data.latestTemperatureCelsius,
                humidity: data.latestHumidityPercent,
              };
              return [...prev.slice(-50), point]; // giữ tối đa 50 điểm
            });
          } catch {
            /* ignore */
          }
        });

        client.publish({
          destination: `/app/dashboard/${deviceId}`,
          body: "",
        });
      },

      onDisconnect: () => setSensor((s) => ({ ...s, connected: false })),
      onStompError: () => setSensor((s) => ({ ...s, connected: false })),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setSensor((s) => ({ ...s, connected: false }));
    };
  }, [deviceId]);

  return { sensor, publish, liveChartData };
}
