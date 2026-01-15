import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function WeatherChart({ weather, unit }) {

     const data = weather.hourly.time.map((time, i) => ({
        time: new Date(time).getHours() + ":00",
        temp: Math.round(weather.hourly.temperature[i]),
    }));

      const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 p-2 rounded-lg shadow-xl">
            <p className="text-white font-bold">{`${payload[0].value}°${unit === 'C' ? 'C' : 'F'}`}</p>
            <p className="text-white/60 text-xs">{payload[0].payload.time}</p>
            </div>
        );
        }
        return null;
    };

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        interval={3}
                    />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

}