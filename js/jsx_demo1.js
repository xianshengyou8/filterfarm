/**
 * Created by chocolate on 2017/7/17.
 */
function Welcome(props) {
	return <h1>Hello, {props.name}</h1>;
}
var obj = {wel:Welcome};
function tick() {
	//https://stackoverflow.com/questions/26882177/react-js-inline-style-best-practices
	const element = (
		<div>
			<h1 style={{color:'blue',fontSize:16}}>Hello, world!</h1>
			<Welcome name="Andrew"/>
			<obj.wel name="Andrew"/>
			<h2>It is {new Date().toLocaleTimeString()}.</h2>
		</div>
	);
	ReactDOM.render(
		element,
		document.getElementById('root')
	);
}
//setInterval(tick, 1000);
if(false){
	var tabTitle = main.decodeQuery();
	let src = filterfarm.src1+tabTitle;
	const element = (
		<iframe
			id="fbCommentFrame"
			src={src}
			width="100%"
			scrolling="yes"
		></iframe>
	);
	ReactDOM.render(
		element,
		document.getElementById('iframeWrapper')
	);
}
