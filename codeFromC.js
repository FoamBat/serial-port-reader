let PowerCom = {};

/* open device */
device=Pc_open_device("/dev/ttyUSB0",9600,0,8,1);

/* print debugging informations */
Pc_verbose=1;

/* try to read registers first */
PowerCom.device=device;
PowerCom.timeout=500;
PowerCom.function=4;

let trame = []
//case 1:	/* ask for serial number */
trame[0]=0xBB; //187
trame[1]=0xBB;
trame[2]=0x00; //0
trame[3]=0x00;
trame[4]=0x00;
trame[5]=0x00;
trame[6]=0x00;
trame[7]=0x00;
trame[8]=0x00;
/* compute crc */
Pc_calcul_checksum(trame,9);
/* compute length of the packet to send */
long_emit=11;
/* compute length of the slave answer */
longueur=11+11;	// 11 Header+checksum, 11 payload


if(Csm_send_and_get_result(trame,Pctrame.timeout,long_emit,longueur))

int Pc_calcul_checksum(byte trame[],int n)
{
	unsigned short checksum;
	int i;
	checksum=0;
	for (i=0;i<n;i++)
	{
		checksum+=trame[i];
	}
	trame[n]= checksum >> 8;
	trame[n+1]=checksum&255;
	return checksum;
}

int Csm_send_and_get_result(unsigned char trame[], int timeout, int long_emit, int longueur)
{
	int i;
	int ret;

	Pcm_result = trame;
	
	if (Pc_verbose)
		fprintf(stderr,"start writing \n");
	for(i=0;i<long_emit;i++)
	{
		/* send data */
		write(Pc_device,&trame[i],1);
		/* call pointer function if exist */
		if(Pc_ptr_snd_data!=NULL)
			(*Pc_ptr_snd_data)(trame[i]);
	}

	tcdrain(Pc_device);

	if (Pc_verbose)
		fprintf(stderr,"write ok\n");

	ret = Csm_get_data(longueur, timeout);
	
	return ret;
}

int Csm_get_data(int len, int timeout)
{
	int i;
	byte read_data;
	time_t t;

	if (Pc_verbose)
		fprintf(stderr,"in get data\n");
	
	t = (time(NULL) + ((timeout * 2)/1000));

	for(i=0;i<(len);i++)
	{
		if(t < time(NULL))
			return(0);

		/* read data */
		while(read(Pc_device,&read_data,1) <= 0)
		{
			if(t < time(NULL))
				return(0);
			usleep(100000);
		}
		/* store data to the slave answer packet */
		Pcm_result[i]=read_data;
		
		if (Pc_verbose)
			fprintf(stderr,"receiving byte :0x%x %d (%d)\n",read_data,read_data,Pcm_result[i]);
	  
	}
	if (Pc_verbose)
		fprintf(stderr,"receiving data done\n");
	return(1);
}
