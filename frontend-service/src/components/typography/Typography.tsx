import React from 'react'
import { cn } from '@/lib/utils'

const Heading = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
	return (
		<h1 
			className={cn('font-titillium text-blue-800 text-4xl font-bold md:mb-2', className)} 
			{...props}
		>
			{children}
		</h1>
	)
}

const Subheading = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
	return (
		<h2 
			className={cn('font-titillium text-2xl text-slate-800 font-bold', className)} 
			{...props}
		>
			{children}
		</h2>
	)
}

const Paragraph = ({ 
	className, 
	...props 
}: React.HTMLAttributes<HTMLParagraphElement>) => {
	return (
		<p className={cn('text-lg text-slate-950', className)} {...props} />
	)
}

export {
	Heading,
	Subheading,
	Paragraph
}