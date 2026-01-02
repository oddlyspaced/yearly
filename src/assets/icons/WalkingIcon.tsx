import Svg, { Path } from 'react-native-svg';
import { IIconProps } from './iconTypes';

export const WalkingIcon = ({
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
			<Path d='M6 12.5l1.738-2.607a2 2 0 01.672-.627l2.189-1.251a1.94 1.94 0 011.83-.05c.656.328 1.037 1.021 1.317 1.7C14.206 10.781 15.398 12 18 12' />
			<Path d='M13 9l-1.223 5.595M10.5 8.5l-.725 3.264a2 2 0 00.724 2.013L14 16.5l1.5 4.5M9.5 16L9 17.5l-2.5 3M15 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
		</Svg>
	);
};
