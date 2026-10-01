import React from "react";
import type { GatsbySSR } from "gatsby";

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
	setHeadComponents([
		<script
			key="adsense"
			async
			src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4961294456876794"
			crossOrigin="anonymous"
		/>,
	]);
};
