import React from 'react';
import Modal from './Modal';
import { Button } from './ui/button';
import { Heading, Subheading, Paragraph } from './typography/Typography';

interface AboutModalProps {
	onClose: () => void;
}

const AboutModal = ({ onClose }: AboutModalProps) => {
	return (
		<Modal>
			<div className="">
				<Heading >
					About
					<span className='text-shadow'> MapGuesser</span>
				</Heading>
				
				<Paragraph className="mb-4">
					MapGuesser lets you guess the locations of cities to test your geography knowledge. 
				</Paragraph>

				<Subheading className="mb-2">How to Play</Subheading>
				<Paragraph className="mb-4 text-left">
					• Look at the city name displayed at the top<br/>
					• Click on the map where you think the city is located<br/>
					• Your score is based on how close your guess is to the actual location<br/>
					• Lower scores are better!
				</Paragraph>

				<Paragraph className='mb-4'>
					For more of my work checkout my <a href="http://paultreanor.com" className="text-blue-800 hover:underline">website</a>.
				</Paragraph>

				<Button 
					onClick={onClose}
					variant="mapguesserSuccess"
					className=""
				>
					Close
				</Button>
			</div>
		</Modal>
	);
};

export default AboutModal;