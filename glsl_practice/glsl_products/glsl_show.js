var c, gl, run eCheck;
var c_w, c_h;
var m_x, m_y;
var startTime;
var time = 0.0;
var tempTime = 0.0;
var fps = 1000/30;
var uniformLocation = new Array();

window.onload = function(){
  //キャンバスの設定
  c = document.getElementById('canvas');
  if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0 ){
    c_w = 834; c_h = 1194;
  }else{
    c_w = 1280; c_h = 720;
  }
  c.width = c_w;
  c.height = c_h;
  c.addEventListener('mousemove', mouseMove, true);

  gl = c.getContext('webgl') || c.getContext('experimental-webgl');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var v_shader = create_shader('vs');
  var f_shader = create_shader('fs');
  var prg = create_program(v_shader, f_shader);
  run = (prg != null);
  if(!run){
    eCheck.checked = false;
  }

	uniformLocation[0] = gl.getUniformLocation(prg, 'time');
	uniformLocation[1] = gl.getUniformLocation(prg, 'mouse');
	uniformLocation[2] = gl.getUniformLocation(prg, 'resolution');

  var position = [
    -1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
  var index = [
		0, 2, 1,
		1, 2, 3
	];
  var v_position = create_vbo(position);
  var v_index = create_ibo(index);
  var v_attLocation = gl.getAttribLocation(prg, 'position');
  var attStride = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, v_position);
  gl.enableVertexAttribArray(v_attLocation);
  gl.vertexAttribPointer(v_attLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, v_index);

  m_x = 0.5;
  m_y = 0.5;
  startTime = new Date().getTime();

  render();
}

startTime = new Date().getTime();
render();

function mouseMove(e){
	m_x = e.offsetX / c_w;
	m_y = e.offsetY / c_h;
}

function create_shader(id){
	var shader;
	var scriptElement = document.getElementById(id);

	if(!scriptElement){
    return;
  }

	switch(scriptElement.type){
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
			return;
	}

	gl.shaderSource(shader, scriptElement.text);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}else{
		alert(gl.getShaderInfoLog(shader));
		console.log(gl.getShaderInfoLog(shader));
	}
}

function create_program(vs, fs){
	var program = gl.createProgram();

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		gl.useProgram(program);
		return program;
	}else{
		return null;
	}
}

function create_vbo(data){
	var vbo = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return vbo;
}

function create_ibo(data){
	var ibo = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return ibo;
}

function create_texture(source){
    var img = new Image();

    img.onload = function(){
        var tex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        texture = tex;
    };

    img.src = source;
}

function render(){
	if(!run){
    return;
  }

	time = (new Date().getTime() - startTime) * 0.001;

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.uniform1f(uniformLocation[0], time + tempTime);
	gl.uniform2fv(uniformLocation[1], [m_x, m_y]);
	gl.uniform2fv(uniformLocation[2], [c_w, c_h]);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	gl.flush();

	setTimeout(render, fps);
}
