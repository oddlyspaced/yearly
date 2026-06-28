import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/core/theme';

interface SparklineProps {
	data: number[];
	width: number;
	height: number;
	color?: string;
	strokeWidth?: number;
	/** Fill a soft gradient under the line. */
	fill?: boolean;
}

/** Minimal monochrome trend line for hero cards. */
export function Sparkline({
	data,
	width,
	height,
	color = colors.ink,
	strokeWidth = 2,
	fill = true,
}: SparklineProps) {
	if (data.length < 2) {
		return <View style={{ width, height }} />;
	}

	const pad = strokeWidth;
	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const stepX = (width - pad * 2) / (data.length - 1);

	const points = data.map((v, i) => {
		const x = pad + i * stepX;
		const y = pad + (height - pad * 2) * (1 - (v - min) / range);
		return [x, y] as const;
	});

	const line = points
		.map(
			([x, y], i) =>
				`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`,
		)
		.join(' ');
	const area = `${line} L${points[points.length - 1][0].toFixed(2)} ${height} L${points[0][0].toFixed(2)} ${height} Z`;

	return (
		<Svg width={width} height={height}>
			<Defs>
				<LinearGradient id='spark-fill' x1='0' y1='0' x2='0' y2='1'>
					<Stop offset='0' stopColor={color} stopOpacity={0.16} />
					<Stop offset='1' stopColor={color} stopOpacity={0} />
				</LinearGradient>
			</Defs>
			{fill ? <Path d={area} fill='url(#spark-fill)' /> : null}
			<Path
				d={line}
				stroke={color}
				strokeWidth={strokeWidth}
				fill='none'
				strokeLinejoin='round'
				strokeLinecap='round'
			/>
		</Svg>
	);
}
