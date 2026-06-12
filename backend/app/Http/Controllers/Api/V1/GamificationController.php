<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Badge;
use App\Models\Achievement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    use ApiResponse;

    public function points(Request $request)
    {
        $user = $request->user();

        return $this->success([
            'xp_points' => $user->xp_points,
            'level' => $user->level,
            'streak_count' => $user->streak_count,
        ]);
    }

    public function badges(Request $request)
    {
        $badges = Badge::where('user_id', $request->user()->id)->latest()->get();

        return $this->success($badges);
    }

    public function achievements(Request $request)
    {
        $achievements = Achievement::where('user_id', $request->user()->id)->latest()->get();

        return $this->success($achievements);
    }

    public function leaderboard()
    {
        $leaders = User::select('id', 'name', 'xp_points', 'level')
            ->orderBy('xp_points', 'desc')
            ->take(20)
            ->get();

        return $this->success($leaders);
    }
}
