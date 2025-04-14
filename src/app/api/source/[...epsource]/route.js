import axios from 'axios';
import { redis } from '@/lib/rediscache';
import { NextResponse, NextRequest } from 'next/server';

// AnimeKai from Consumet (replacement for Gogoanime)
async function animekaiEpisode(id) {
  try {
    const { data } = await axios.get(
      `${process.env.CONSUMET_URI}/meta/anilist/watch/${id}?provider=animekai`
    );
    return data;
  } catch (error) {
    console.error('Animekai Episode Error:', error);
    return null;
  }
}

// Zoro server from Consumet
async function consumetZoroEpisode(id) {
  try {
    const { data } = await axios.get(
      `${process.env.CONSUMET_URI}/meta/anilist/watch/${id}?provider=zoro`
    );
    return data;
  } catch (error) {
    console.error('Consumet Zoro Episode Error:', error);
    return null;
  }
}

// Anify fallback (still present as backup)
async function AnifyEpisode(provider, episodeid, epnum, id, subtype) {
  try {
    const { data } = await axios.get(
      `https://anify.eltik.cc/sources?providerId=${provider}&watchId=${encodeURIComponent(
        episodeid
      )}&episodeNumber=${epnum}&id=${id}&subType=${subtype}`
    );
    return data;
  } catch (error) {
    console.error('Anify Episode Error:', error);
    return null;
  }
}

export const POST = async (req, { params }) => {
  const id = params.epsource[0];
  const { source, provider, episodeid, episodenum, subtype } = await req.json();

  if (source === 'consumet') {
    // animekai as new gogoanime
    if (provider === 'animekai') {
      const data = await animekaiEpisode(episodeid);
      return NextResponse.json(data);
    }

    // zoro via consumet
    if (provider === 'zoro') {
      const data = await consumetZoroEpisode(episodeid);
      return NextResponse.json(data);
    }
  }

  if (source === 'anify') {
    const data = await AnifyEpisode(provider, episodeid, episodenum, id, subtype);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Invalid source or provider' }, { status: 400 });
};
