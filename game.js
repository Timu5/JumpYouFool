var debug = true;

var Input =
{
	State: 0, // 0 -> no input, 1 -> tap
	Init: function()
	{
		Game.can.addEventListener('mousedown', Input.MouseDownCallback, false);
	},

	MouseDownCallback: function(e)
	{
		Input.State = 1;
	},

	GetState: function()
	{
		var tmp = Input.State;
		Input.State = 0;
		return tmp;
	}
};

var Game = 
{
	can: 0,
	ctx: 0,

	Start: function()
	{
		Game.can = document.getElementById('Canvas');
		Game.ctx = Canvas.getContext('2d');
		Game.can.width  = window.innerWidth;
		Game.can.height = window.innerHeight; 
		Game.Init();
		requestAnimationFrame(Game.Tick);
	},

	oldTime: 0,
	frames: 0,
	fps: 0,
	counter: 20,
	Tick: function(time)
	{
		var newtime = time - Game.oldTime;
		Game.oldTime = time;
		Game.Update(newtime);
		Game.Draw();
		Game.counter++;
		if(debug)
		{
			Game.frames += (1/newtime*1000);
			if(Game.counter > 20) // Update onscreen fps every 20 frames
			{
				Game.fps = (Game.frames / Game.counter) | 0;
				Game.frames = 0;
				Game.counter = 0;
			}
			Game.ctx.font = '20pt Calibri';
			Game.ctx.fillStyle = 'white';
			Game.ctx.fillText(Game.fps.toString(), 00, 20);
			Game.ctx.strokeText(Game.fps.toString(), 00, 20);
		}
		requestAnimationFrame(Game.Tick);
	},

	Best: 0,
	Height: 0,
	TempHeight: 0,
	Player: 0,
	PlayerO: 0,
	Jump: 0,
	Blocks: [],
	Iteration: 0, // hold index of block that is around player y position
	Lose: 1,
	w2: 0,
	h2: 0,
	h4: 0,
	s: 20,
	s2: 10,
	LoseDiv: 0,
	BestDiv: 0,
	ScoreDiv: 0,
	Init: function()
	{
		Game.LoseDiv = document.getElementById("lose");
		Game.BestDiv = document.getElementById("best");
		Game.ScoreDiv = document.getElementById("score");
		Game.w2 = Game.can.width / 2;
		Game.h2 = Game.can.height / 2;
		Game.h4 = Game.can.height / 4;
		Game.s = Game.can.width / 15;
		Game.s2 = Game.s / 2;
	},

	Update: function(time)
	{
		if(Game.Lose == 0)
		{
			if(time > 500) // anticheat
				Game.GameOver();
			var tmp = time / 3;
			Game.Height += tmp;
			Game.TempHeight += tmp;
			if(Game.TempHeight > Game.s)
			{
				var ran = Math.random() * 2 | 0; // rand between 0 and 2
				if(ran != 2)
				{
					var t = ran;
					ran = Math.random() * 6 | 0;
					if(ran != 0)
						Game.Blocks.push({x:t, y:Game.Height, h:++ran}); // Add new blocks based on random values
					Game.TempHeight = -(ran + 1) * Game.s;
				}
				else
					Game.TempHeight = 0;
			}
		
			if(Game.Jump == 1)
			{
				if(Game.PlayerO == 1)
				{
					Game.Player -= time / 100;
					if(Game.Player <= 0)
						Game.Player = 0.0;		
				}
				else
				{
					Game.Player += time / 100;
					if(Game.Player >= 1)
						Game.Player = 1.0;
				}
				
				if(Game.Player == 0.0)
				{
					Game.Jump = 0;
					Game.PlayerO = 0;
				}
				else if(Game.Player == 1.0)
				{
					Game.Jump = 0;
					Game.PlayerO = 1;
				}
			}
			
			if(Input.GetState() == 1)
			{
				Game.Jump = 1;
			}
		
			for (var i = 0; i < Game.Blocks.length; i++)
			{
				if(i == Game.Iteration && Game.Height - Game.Blocks[i].y > Game.h2 + Game.s * Game.Blocks[Game.Iteration].h)
				{
					Game.Iteration++;
				}
				else if(Game.Height - Game.Blocks[i].y - Game.s * Game.Blocks[i].h > Game.can.height)
				{
					Game.Blocks.splice(i--, 1); // remove block that is below screen
					Game.Iteration--;
				}
			}
			
			if(Game.Blocks.length != 0 && Game.Blocks.length > Game.Iteration)
			{
				if(Game.Blocks[Game.Iteration].x == Game.Player)
				{
					tmp = Game.Height - Game.Blocks[Game.Iteration].y;
					if(tmp > Game.h2 - Game.s)
						if(tmp < Game.h2 + Game.s * Game.Blocks[Game.Iteration].h)
							Game.GameOver();
					//Input.State = 1; // AutoPlay mode ;)
				}
			}
		}
		else
		{
			if(Input.GetState() == 1) // restart
			{
				Game.Reset();
			}
		}
	},
	
	GameOver: function()
	{
		Game.Lose = 1;
		if(Game.Height > Game.Best)
			Game.Best = Game.Height;
		Game.BestDiv.innerHTML = (Game.Best / 500 | 0).toString();    // set best score
		Game.ScoreDiv.innerHTML = (Game.Height / 500 | 0).toString(); // set score
		Game.LoseDiv.style.visibility = "visible"; // show panel
	},
	
	Draw: function()
	{
		Game.ctx.clearRect(0, 0, Game.can.width, Game.can.height);
		
		Game.ctx.fillText(Game.Height / 500 | 0, Game.w2, Game.h4);
		
		Game.ctx.fillStyle = 'green';
		var w = Game.can.width - Game.s;
		var x = Game.Player * w;
		var y = Game.can.height / 2;
		Game.ctx.fillRect(x, y - Game.s2, Game.s, Game.s);
		
		Game.ctx.fillStyle = 'white';
		w = Game.can.width - Game.s2;
		for (var i = 0; i < Game.Blocks.length; i++)
		{
			var x = Game.Blocks[i].x == 0 ? Game.s2 : w;
			var y = Game.Height - Game.Blocks[i].y;
			for (var j = 0; j < Game.Blocks[i].h; j++)
			{
				Game.ctx.beginPath();
				Game.ctx.moveTo(x, y - j * Game.s);
				if(Game.Blocks[i].x == 0)
				{
					Game.ctx.lineTo(x - Game.s2, y + Game.s2 - j * Game.s);
					Game.ctx.lineTo(x - Game.s2, y - Game.s2 - j * Game.s);
				}
				else
				{
					Game.ctx.lineTo(x + Game.s2, y + Game.s2 - j * Game.s);
					Game.ctx.lineTo(x + Game.s2, y - Game.s2 - j * Game.s);
				}
				Game.ctx.fill();
			}
		}
	},
	
	Reset: function()
	{
		Game.Iteration = 0;
		Game.Height = 0;
		Game.TempHeight = 0;
		Game.Blocks = [];
		Game.Lose = 0;
		Game.LoseDiv.style.visibility = "hidden"; // hide  panel
	}
}

Game.Start();
Input.Init();
//Game.Reset();