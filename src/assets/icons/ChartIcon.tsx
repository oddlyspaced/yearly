import Svg, { Path } from 'react-native-svg';
import { IIconProps } from './iconTypes';

export const ChartIcon = ({
	color = '#111',
	width = 16,
	height = 16,
}: IIconProps) => {
	return (
		<Svg
			viewBox='0 0 24 24'
			width={width}
			height={height}
			color={color}
			fill='none'
			stroke={color}
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<Path d='M8 17v-3M12 14V9M16 9V6M20 10V4M3 3v11c0 3.3 0 4.95 1.025 5.975C5.05 21 6.7 21 10 21h11' />
		</Svg>
	);
};
