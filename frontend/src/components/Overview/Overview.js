import classes from "./Overview.module.css";
import Card from "../UI/Card";
import { useEffect, useCallback, useState } from "react";
import { FlexTable, Column, Row, Label, Value } from "../UI/FlexTable";
import { Config } from "../../config/config";
import { ConnectionStatus } from "../../context/conn-status";

const Overview = ({ setConnStatus, connStatus }) => {
   const [uptime, setUptime] = useState(null);

   const fetchUptime = useCallback(async () => {
      let response = null;
      try {
         response = await fetch(Config.Endpoints.Uptime);
      } catch (error) {
         setConnStatus(ConnectionStatus.ServerOffline);
         return;
      }
      if (!response.ok) {
         setConnStatus(ConnectionStatus.Error);
         return;
      }
      const data = await response.json();
      setUptime(data);
      setConnStatus(ConnectionStatus.Ok);
   }, [setUptime, setConnStatus]);

   useEffect(() => {
      const pollPeriod =
         connStatus === ConnectionStatus.Ok
            ? Config.POLL_PERIOD_MS
            : Config.SLOW_POLL_PERIOD_MS;
      const interval = setInterval(fetchUptime, pollPeriod);
      return () => {
         clearInterval(interval);
      };
   }, [connStatus, fetchUptime]);
   useEffect(() => {
      fetchUptime();
   }, [fetchUptime]);

   // Apply style to connection status value, depending on the current status
   let connStatusStyle = classes["conn-status-unknown"];
   if (connStatus === ConnectionStatus.Ok) {
      connStatusStyle = classes["conn-status-ok"];
   } else if (
      connStatus === ConnectionStatus.ServerOffline ||
      connStatus.Error
   ) {
      connStatusStyle = classes["conn-status-not-ok"];
   }

   let uptimeDaysHoursMinutes = "";
   if (uptime) {
      const days = Math.floor(uptime.hours / 24);
      const hours = uptime.hours - days * 24;
      uptimeDaysHoursMinutes = `${days}d${hours}h${uptime.minutes}m`;
   }

   return (
      <Card title="System">
         <FlexTable columns={2}>
            <Column>
               <Row>
                  <Label>Connection Status</Label>
                  <Value>
                     <span className={connStatusStyle}>{connStatus}</span>
                  </Value>
               </Row>
            </Column>
            <Column>
               <Row>
                  <Label>Uptime</Label>
                  <Value>{uptime && uptime.formatted}</Value>
               </Row>
               <Row>
                  <Label></Label>
                  <Value>{uptimeDaysHoursMinutes}</Value>
               </Row>
            </Column>
         </FlexTable>
      </Card>
   );
};

export default Overview;
