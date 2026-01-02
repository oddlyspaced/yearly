import Svg, { Path } from 'react-native-svg';
import { IIconProps } from './iconTypes';

export const AddIcon = ({
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
			strokeWidth={2.4}
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<Path d='M12.001 5v14.002M19.002 12.002H5' />
		</Svg>
	);
};
