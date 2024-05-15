import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


const chronoTo = (to, detailed, d) => {
    const duration = moment.duration(moment(to).diff(moment()));
    if (detailed) {
        return durationToChrono(duration, d);
    } else if (duration.days() > 0) {
        return moment(to).fromNow(true);
    } else {
        return durationToChrono(duration, d);
    }
}


export const Chrono = (props) => {
    const { t } = useTranslation();
    const start = props.start;
    const end = props.end;
    const [chrono, setChrono] = useState();

    const loop = () => {
        const when = whenFunction(start, end);
        if (when === "now") {
            setChrono(chronoTo(end, true, t('Date.d')));
        } else if (when === "coming") {
            setChrono(chronoTo(start, false, t('Date.d')));
        } else if (when === "passed") {
            setChrono(moment(end).fromNow());
        } else {
            setChrono("");
        }
    }

    useEffect(() => {
        loop();
        const interval = setInterval(() => {
            loop();
        }, 1000);
        return () => clearInterval(interval);
    }, [start, end])

    return chrono;
}

export const whenFunction = (start, end) => {
    var now = moment();
    if (moment(start).isSameOrBefore(now) && moment(end).isAfter(now)) {
        return "now";
    }
    if (moment(start).isAfter(now)) {
        return "coming";
    }
    if (moment(end).isBefore(now)) {
        return "passed";
    }
}

const durationToChrono = (duration, d) => {
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    if (days > 0) {
        return (days + d + " " + hours + "h " + minutes + "min " + seconds + "s");
    } else if (hours > 0) {
        return (hours + "h " + minutes + "min " + seconds + "s");
    } else if (minutes > 0) {
        return (minutes + "min " + seconds + "s");
    } else {
        return (seconds + "s");
    }
}