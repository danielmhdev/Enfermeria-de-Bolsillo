import { NativeTabs } from "expo-router/native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="plus.forwardslash.minus" md="calculate" />
        <NativeTabs.Trigger.Label>Calculadora</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="farmacos">
        <NativeTabs.Trigger.Icon sf="pills.fill" md="medication" />
        <NativeTabs.Trigger.Label>Fármacos</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="escalas">
        <NativeTabs.Trigger.Icon sf="list.clipboard.fill" md="fact_check" />
        <NativeTabs.Trigger.Label>Escalas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guia">
        <NativeTabs.Trigger.Icon sf="bandage.fill" md="healing" />
        <NativeTabs.Trigger.Label>Guía</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tareas">
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
        <NativeTabs.Trigger.Label>Tareas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}